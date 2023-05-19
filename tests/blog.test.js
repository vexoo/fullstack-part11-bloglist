const listHelper = require('../utils/list_helper')
const {
    listWithZeroBlogs,
    listWithOneBlog,
    listWithManyBlogs } = require('./blogList_helper')

test('dummy returns one', () => {

    const result = listHelper.dummy(listWithZeroBlogs)
    expect(result).toBe(1)
})

describe('total likes', () => {

    test('of an empty list is zero', () => {
        const result = listHelper.totalLikes(listWithZeroBlogs)
        expect(result).toBe(0)
    })

    test('when list has only one blog, equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog)
        expect(result).toBe(5)
    })
    test('of a bigger list is calculated right', () => {
        const result = listHelper.totalLikes(listWithManyBlogs)
        expect(result).toBe(36)
    })
})

describe('most liked blog', () => {

    test('of an empty list is null', () => {
        const result = listHelper.favoriteBlog(listWithZeroBlogs)
        expect(result).toEqual(null)
    })

    test('when the list has only one blog, equals that blog', () => {
        const result = listHelper.favoriteBlog(listWithOneBlog)
        expect(result).toEqual({
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            likes: 5
        })
    })
    test('of a bigger list is the most liked one', () => {
        const result = listHelper.favoriteBlog(listWithManyBlogs)
        expect(result).toEqual({
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            likes: 12
        })
    })
})

describe('author with most blogs', () => {

    test('of an empty list is null', () => {
        const result = listHelper.mostBlogs(listWithZeroBlogs)
        expect(result).toEqual(null)
    })

    test('when the list has only one blog, equals the writer of that blog', () => {
        const result = listHelper.mostBlogs(listWithOneBlog)
        expect(result).toEqual({
            author: 'Edsger W. Dijkstra',
            blogs: 1
        })
    })
    test('of a bigger list is indeed the author with most blogs', () => {
        const result = listHelper.mostBlogs(listWithManyBlogs)
        expect(result).toEqual({
            author: 'Robert C. Martin',
            blogs: 3
        })
    })
})

describe('author with most likes', () => {

    test('of an empty list is null', () => {
        const result = listHelper.mostLikes(listWithZeroBlogs)
        expect(result).toEqual(null)
    })

    test('when the list has only one blog, equals the writer of that blog', () => {
        const result = listHelper.mostLikes(listWithOneBlog)
        expect(result).toEqual({
            author: 'Edsger W. Dijkstra',
            likes: 5
        })
    })
    test('of a bigger list is indeed the author with most likes', () => {
        const result = listHelper.mostLikes(listWithManyBlogs)
        expect(result).toEqual({
            author: 'Edsger W. Dijkstra',
            likes: 17
        })
    })
})