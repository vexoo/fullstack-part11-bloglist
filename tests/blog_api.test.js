const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const testHelper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
const Blog = require("../models/blog")

const { initialUsers, listWithManyBlogs } = require('./blogList_helper')
let token

beforeEach(async () => {
    await User.deleteMany({})

    await api
        .post('/api/users')
        .send(initialUsers[0])

    await api
        .post('/api/login')
        .send({
            username: initialUsers[0].username,
            password: initialUsers[0].password
        })
        .expect(response => { token = response.body.token })


    await Blog.deleteMany({})

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(listWithManyBlogs[0])

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(listWithManyBlogs[1])
})

describe('when there is initially some blogs saved', () => {
    test('the blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('the id property of the blogs is named id instead of _id', async () => {
        const blogs = await api.get('/api/blogs')

        const idArray = blogs.body.map(blog => blog.id)

        idArray.forEach(id => expect(id).toBeDefined())
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
            url: "https://www.test.com",
            likes: 0
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')

        expect(response.body.length).toBe(blogsBefore.length + 1)
        expect(response.body.map(blog => blog.title)).toContainEqual('test blog')
    })

    test('adding a blog does not work without a valid token', async () => {

        const newBlog = {
            title: 'test blog',
            author: 'test author',
            url: "https://www.test.com",
            likes: 0
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })

    test('missing likes property defaults to 0', async () => {
        const newBlog = {
            title: 'test blog',
            author: 'test author',
            url: "https://www.test.com"
        }

        await api
            .post('/api/blogs')
            .set("Authorization", `Bearer ${token}`)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')
        const addedBlog = response.body.find(blog => blog.title === 'test blog')
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

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(401)

        const blogsAfter = await testHelper.blogsInDb()
        console.log(blogsAfter);
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
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with an invalid username', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const newUser = {
            username: 'ml',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })
})


afterAll(async () => {
    await mongoose.connection.close()
})