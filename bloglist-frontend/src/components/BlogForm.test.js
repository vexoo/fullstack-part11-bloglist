import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> calls the event handler when a new blog is created', async () => {

  const mockHandler = jest.fn()

  render(<BlogForm handleAddBlog={mockHandler} />)

  const user = userEvent.setup()
  const button = screen.getByText('create')
  await user.click(button)

  expect(mockHandler).toBeCalledTimes(1)

})