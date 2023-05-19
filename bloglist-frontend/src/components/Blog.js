import { useState } from 'react'

const Blog = ({ blog, handleLikes, handleRemoval, username }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const addLike = () => {
    const likedBlog = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
      user: blog.user.id
    }
    handleLikes(blog.id, likedBlog)
  }

  const removeBlog = () => {
    if (window.confirm(`Remove blog '${blog.title}' by ${blog.author}?`)) {
      handleRemoval(blog.id)
    }
  }

  return (
    <div style={blogStyle} className='blog'>
      <div className='title'>
        &apos;{blog.title}&apos; by {blog.author}
        <button id='details' style={{ marginLeft: '5px', marginBottom: '2px' }} onClick={toggleDetails}>{showDetails ? 'hide' : 'view'}</button>
      </div>
      {showDetails && (
        <div className='blog-details'>
          <div>URL: {blog.url}</div>
          <div>
            likes: {blog.likes}
            <button id='addLike' style={{ marginLeft: '5px' }} onClick={addLike}>like</button>
          </div>
          <div>{blog.user.name}</div>
          {blog.user.username === username && (
            <button id='delete' style={{ marginTop: '2px' }} onClick={removeBlog}>delete</button>
          )}
        </div>
      )}
    </div>

  )
}

export default Blog