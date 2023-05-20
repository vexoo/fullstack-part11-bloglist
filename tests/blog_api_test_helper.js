/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-await */
const { signToken } = require("../utils/tokenGen")
const Blog = require("../models/blog")
const User = require("../models/user")

const testBlog = {
  author: "test author",
  title: "test title",
  url: "https://test.com/test",
}

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  },
]

const authorizationHeader = (user) => ({
  Authorization: `Bearer ${signToken(user)}`,
})

const blogsInDb = async () => (await Blog.find({})).map((blog) => blog.toJSON())

const nonExistingId = async () => {
  const blog = new Blog(testBlog)
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const initUsers = async () => {
  await User.deleteMany({})
  return await User.create({
    username: "test",
    name: "Test",
    passwordHash: "*******",
  })
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = {
  authorizationHeader,
  blogsInDb,
  testBlog,
  initialBlogs,
  initUsers,
  nonExistingId,
  usersInDb,
}