export const displayMessage = (message, isError, setErrorMessage, setErrorColor) => {
  const color = isError ? 'red' : 'green'
  setErrorColor(color)
  setErrorMessage(message)
  setTimeout(() => {
    setErrorMessage(null)
    setErrorColor('green')
  }, 5000)
}

const Notification = ({ message, color }) => {
  const notificationStyle = {
    color: color || 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }


  if (message === null) {
    return null
  }

  return (
    <div id='notification' style={notificationStyle}>
      {message}
    </div>
  )
}

export default Notification