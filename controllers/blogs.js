const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    if (!request.token) {
        return response.status(401).json({ error: 'missing token' })
    }
    token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    const user = request.user

    const blog = await new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id
    }).populate("user", { username: 1, name: 1 })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()

    response.status(201).json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {

    const user = request.user
    if (!request.token) {
        return response.status(401).json({ error: 'missing token' })
    }

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const id = request.params.id
    const blog = await Blog.findById(id)

    if (blog.user.toString() === user.id.toString()) {
        await Blog.findByIdAndRemove(request.params.id)
        response.sendStatus(204).end()
    } else {
        response.status(401).json({ error: "unauthorized operation" })
    }
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        body,
        { new: true }
    ).populate("user", { username: 1, name: 1 })

    if (updatedBlog) {
        response.status(200).json(updatedBlog)
    } else {
        response.status(404).end()
    }
})

module.exports = blogsRouter