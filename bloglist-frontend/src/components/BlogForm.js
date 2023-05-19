import { useState } from 'react'

const BlogForm = ({ handleAddBlog }) => {
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: ''
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setNewBlog({ ...newBlog, [name]: value })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleAddBlog(newBlog.title, newBlog.author, newBlog.url)
    setNewBlog({
      title: '',
      author: '',
      url: ''
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        Title:
        <input
          id='title'
          type='text'
          value={newBlog.title}
          name='title'
          onChange={handleInputChange}
        />
      </div>
      <div>
        Author:
        <input
          id='author'
          type='text'
          value={newBlog.author}
          name='author'
          onChange={handleInputChange}
        />
      </div>
      <div>
        URL:
        <input
          id='url'
          type='text'
          value={newBlog.url}
          name='url'
          onChange={handleInputChange}
        />
      </div>
      <button id='createBlog' style={{ marginTop: '10px' }} type="submit">create</button>
    </form>
  )
}

export default BlogForm