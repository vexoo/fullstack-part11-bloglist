import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'


describe('Blog rendering', () => {
  const blog = {
    title: 'test blog',
    author: 'test author',
    url: 'www.testurl.com',
    likes: 1,
    user: {
      username: 'username',
      name: 'name'
    }
  }
  const mockHandler = jest.fn()

  test('renders title and author by default, but not url or likes', () => {
    const component = render(
      <Blog blog={blog} />
    )
    //screen.debug()
    expect(component.container.querySelector('.title')).toHaveTextContent(blog.title)
    expect(component.container.querySelector('.title')).toHaveTextContent(blog.author)
    expect(component.queryByText(blog.url)).not.toBeInTheDocument()
    expect(component.queryByText('likes')).not.toBeInTheDocument()
  })

  test('clicking the view details button calls event handler once', () => {
    const component = render(
      <Blog blog={blog} />
    )
    const button = component.container.querySelector('button')
    fireEvent.click(button)

    expect(component.container.querySelector('.blog-details')).toBeVisible()
  })

  test('clicking the like button twice calls event handler twice', () => {
    const component = render(
      <Blog blog={blog} handleLikes={mockHandler}/>
    )
    const button = component.container.querySelector('button')
    fireEvent.click(button)
    //screen.debug()
    const likeButton = component.getByText('like')
    fireEvent.click(likeButton)
    fireEvent.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
  })

})


