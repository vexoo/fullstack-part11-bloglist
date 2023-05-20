/* eslint-disable no-underscore-dangle */
/* eslint-disable import/order */
/* eslint-disable no-return-assign */
const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./blog_api_test_helper")
const app = require("../app")

const api = supertest(app)
const bcrypt = require("bcrypt")
const Blog = require("../models/blog")
const User = require("../models/user")

beforeEach(async () => {
  await Blog.deleteMany({})
  await Promise.all(helper.initialBlogs.map((blog) => new Blog(blog).save()))
})

describe("when there is initially some notes saved", () => {
  test("bloges are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/)
  })

  test("there is one blog", async () => {
    const response = await api.get("/api/blogs")

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

test("there is an id", async () => {
  const response = await api.get("/api/blogs")
  console.log(response)
  expect(response.body[0].id).toBeDefined()
})

describe("addition of a new blog", () => {
  let user
  beforeEach(async () => (user = await helper.initUsers()))
  test("you can add blog", async () => {
    await api
      .post("/api/blogs")
      .set(helper.authorizationHeader(user))
      .send(helper.testBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const authors = blogsAtEnd.map((n) => n.author)
    expect(authors).toContain(helper.testBlog.author)
  })

  test("entries without likes fields turns 0", async () => {
    const response = await api
      .post("/api/blogs")
      .set(helper.authorizationHeader(user))
      .send(helper.testBlog)
      .expect(201)

    expect(response.body.likes).toEqual(0)
  })

  test("blog without content is not added(1)", async () => {
    const newBlog = {
      author: "swszx",
      url: "https://poe",
      likes: 121213,
    }

    await api.post("/api/blogs").send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test("blog without content is not added(2)", async () => {
    const newBlog = {
      title: "poe",
      author: "swszx",
      likes: 121213,
    }

    await api.post("/api/blogs").send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash("sekret", 10)
    const user = new User({ username: "root", passwordHash })

    await user.save()
  })

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    }

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    expect(result.body.error).toContain("expected `username` to be unique")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

describe("cant add user with bad credentials", () => {
  test("cant get with short password", async () => {
    const user = {
      username: "dima",
      name: "LOL",
      password: "23",
    }
    await api.post("/api/users/").send(user).expect(400)
  })
  test("cant get without nickname", async () => {
    const user = {
      name: "LOL",
      password: "22133",
    }
    await api.post("/api/users/").send(user).expect(400)
  })
  test("cant get with short nickname", async () => {
    const user = {
      username: "di",
      name: "LOL",
      password: "22133",
    }
    await api.post("/api/users/").send(user).expect(400)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

/*
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const testHelper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
const Blog = require('../models/blog')

const { initialUsers, listWithManyBlogs } = require('./blogList_helper')
let token

beforeEach(async () => {
  await User.deleteMany({})

  await api.post('/api/users').send(initialUsers[0])

  await api
    .post('/api/login')
    .send({
      username: initialUsers[0].username,
      password: initialUsers[0].password
    })
    .expect((response) => {
      token = response.body.token
    })

  await Blog.deleteMany({})

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(listWithManyBlogs[0])

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(listWithManyBlogs[1])
}, 10000)

describe('when there is initially some blogs saved', () => {
  test('the blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  test('the id property of the blogs is named id instead of _id', async () => {
    const blogs = await api.get('/api/blogs')

    const idArray = blogs.body.map((blog) => blog.id)

    idArray.forEach((id) => expect(id).toBeDefined())
  })
  test('updating properties of a blog works', async () => {
    const blogs = await testHelper.blogsInDb()
    const blogToUpdate = blogs[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: blogToUpdate.likes + 1 })
      .expect(200)

    const blogsAfter = await api.get('/api/blogs')
    const updatedBlog = blogsAfter.body[0]
    expect(updatedBlog.likes).toEqual(blogToUpdate.likes + 1)
  })
})

describe('tests for blog addition', () => {
  test('adding a blog works', async () => {
    const blogsBefore = await testHelper.blogsInDb()

    const newBlog = {
      title: 'test blog',
      author: 'test author',
      url: 'https://www.test.com',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(blogsBefore.length + 1)
    expect(response.body.map((blog) => blog.title)).toContainEqual('test blog')
  })

  test('adding a blog does not work without a valid token', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'test author',
      url: 'https://www.test.com',
      likes: 0
    }

    await api.post('/api/blogs').send(newBlog).expect(401)
  })

  test('missing likes property defaults to 0', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'test author',
      url: 'https://www.test.com'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    const response = await api.get('/api/blogs')
    const addedBlog = response.body.find((blog) => blog.title === 'test blog')
    expect(addedBlog.likes).toBe(0)
  })
})

describe('tests for blog deletion', () => {
  test('deleting a blog works', async () => {
    const blogsBefore = await testHelper.blogsInDb()
    const blogToDelete = blogsBefore[0]
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAfter = await testHelper.blogsInDb()
    expect(blogsAfter).toHaveLength(blogsBefore.length - 1)
  })

  test('deleting a blog without a token does not work', async () => {
    const blogsBefore = await testHelper.blogsInDb()
    const blogToDelete = blogsBefore[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAfter = await testHelper.blogsInDb()
    console.log(blogsAfter)
    expect(blogsAfter).toHaveLength(blogsBefore.length)
  })
})

describe('behavior when a blog property is missing is correct', () => {
  test('missing title property results in status code 400 - Bad Request', async () => {
    const newBlog = {
      author: 'test author',
      url: 'https://www.test.com',
      likes: 0
    }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
    expect(response.body.error).toContain('Blog validation failed')
  })

  test('missing url property results in status code 400 - Bad Request', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'test author',
      likes: 0
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
    expect(response.body.error).toContain('Blog validation failed')
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a valid username', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with an invalid username', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      username: 'ml',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api.post('/api/users').send(newUser).expect(400)

    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).not.toContain(newUser.username)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

*/