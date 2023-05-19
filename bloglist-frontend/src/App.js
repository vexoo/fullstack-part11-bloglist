import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import Toggleable from './components/Toggleable'
import { displayMessage } from './components/Notification'


const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorColor, setErrorColor] = useState('green')
  const [user, setUser] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJson = window.localStorage.getItem('loggedBlogappUser')

    if (loggedUserJson) {
      const user = JSON.parse(loggedUserJson)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = async (title, author, url) => {
    blogFormRef.current.toggleVisibility()
    const newBlog = await blogService.create({ title, author, url })
    setBlogs(blogs.concat(newBlog))
    displayMessage(`new blog '${title}' by ${author} has been added`, false, setErrorMessage, setErrorColor)
  }


  const handleLikes = async (id, likedBlog) => {
    try {
      const updatedBlog = await blogService.update(id, likedBlog)
      const newBlogs = blogs.map(blog =>
        blog.id === id ? updatedBlog : blog
      )
      setBlogs(newBlogs)
    } catch (exception) {
      displayMessage(exception.response.data.error, true, setErrorMessage, setErrorColor)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)

    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      displayMessage('Wrong username or password', true, setErrorMessage, setErrorColor)
    }
  }

  const handleLogout = () => {
    window.localStorage.clear()
    setUser(null)
  }

  const handleRemoval = async (id) => {
    try {
      await blogService.remove(id)
      const newBlogs = blogs.filter(blog =>
        blog.id !== id
      )
      setBlogs(newBlogs)
      displayMessage('Blog removed', false, setErrorMessage, setErrorColor)
    } catch (exception) {
      displayMessage(exception.response.data.error, true, setErrorMessage, setErrorColor)
    }
  }



  return (
    <div>
      <h2>Blogs</h2>
      <Notification message={errorMessage} color={errorColor} />
      {user === null ?
        <LoginForm
          handleLogin={handleLogin}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          username={username}
          password={password}
        /> : (
          <div>
            <p>
              {user.name} logged in -
              <button id='logout-button' style={{ marginLeft: '5px' }}
                onClick={() => handleLogout()}>
                logout</button>
            </p>
            {blogs
              .sort((a, b) => b.likes - a.likes)
              .map(blog =>
                <div key={blog.id} className='blog'>
                  <Blog blog={blog} handleLikes={handleLikes} handleRemoval={handleRemoval} username={user.username} />
                </div>
              )}
            <Toggleable buttonLabel="new blog" ref={blogFormRef}>
              <h3>Create a new blog</h3>
              <BlogForm handleAddBlog={addBlog} />
            </Toggleable>
          </div>
        )
      }
    </div>
  )
}

export default App