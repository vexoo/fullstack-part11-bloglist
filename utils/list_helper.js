const dummy = (blogs) => {
    return 1
}

function likes(blog) {
    return blog.likes;
}

const totalLikes = (blogs) => {
    return blogs.length === 0 ? 0 : blogs.map(likes).reduce((sum, blog) => {
        return sum + blog
    }, 0)
}


const favoriteBlog = (blogs) => {
    if (blogs.length === 0) { return null }

    const mostLiked = blogs.reduce((a, b) => {
        return a.likes > b.likes ? a : b
    })

    return {
        title: mostLiked.title,
        author: mostLiked.author,
        likes: mostLiked.likes
    }
}

function getTopAuthor(authorsByCounts) {
    return Object.keys(authorsByCounts).reduce((a, b) => {
        return authorsByCounts[a] > authorsByCounts[b] ? a : b
    })
}

const mostBlogs = (blogs) => {

    if (blogs.length === 0) { return null }

    const authorsByBlogCounts = {}

    blogs.forEach((blog) => {
        if (!authorsByBlogCounts[blog.author]) {
            authorsByBlogCounts[blog.author] = 1
        } else {
            authorsByBlogCounts[blog.author]++
        }
    })


    const authorWithMostBlogs = getTopAuthor(authorsByBlogCounts)

    return {
        author: authorWithMostBlogs,
        blogs: authorsByBlogCounts[authorWithMostBlogs]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) { return null }

    const authorsByBlogLikes = {}

    blogs.forEach((blog) => {
        if (!authorsByBlogLikes[blog.author]) {
            authorsByBlogLikes[blog.author] = blog.likes
        } else {
            authorsByBlogLikes[blog.author] += blog.likes
        }
    })

    const authorWithMostLikes = getTopAuthor(authorsByBlogLikes)

    return {
        author: authorWithMostLikes,
        likes: authorsByBlogLikes[authorWithMostLikes]
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}