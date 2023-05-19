describe('Blog app', function () {
  beforeEach(function () {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:3000')
  })

  it('Login form is shown', function () {
    cy.contains('Log in to application')
  })

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()
      cy.contains('Matti Luukkainen logged in')
    })

    it('fails with wrong credentials', function () {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salai')
      cy.get('#login-button').click()
      cy.contains('Wrong username or password')
      cy.get('#notification').should('have.css', 'color').and('equal', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', function () {
    beforeEach(function () {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()
    })

    it('A blog can be created', function () {
      cy.get('#newBlog').click()
      cy.get('#title').type('test blog')
      cy.get('#author').type('test author')
      cy.get('#url').type('www.test.com')
      cy.get('#createBlog').click()
      cy.contains('new blog \'test blog\' by test author has been added')
    })

    it('A blog can be liked', function () {
      cy.get('#newBlog').click()
      cy.get('#title').type('test blog')
      cy.get('#author').type('test author')
      cy.get('#url').type('www.test.com')
      cy.get('#createBlog').click()
      cy.get('#details').click()
      cy.get('#addLike').click()
      cy.contains('likes: 1')
    })

    it('A blog can be deleted by the user who created the blog entry', function () {
      cy.get('#newBlog').click()
      cy.get('#title').type('test blog')
      cy.get('#author').type('test author')
      cy.get('#url').type('www.test.com')
      cy.get('#createBlog').click()
      cy.get('#details').click()
      cy.get('#delete').click()
      cy.contains('Blog removed')
    })

    it('A blog can not be deleted by anyone else', function () {
      cy.get('#newBlog').click()
      cy.get('#title').type('test blog')
      cy.get('#author').type('test author')
      cy.get('#url').type('www.test.com')
      cy.get('#createBlog').click()

      const user = {
        name: 'deleteTest',
        username: 'delete',
        password: 'salainen'
      }
      cy.request('POST', 'http://localhost:3003/api/users/', user)

      cy.get('#logout-button').click()

      cy.get('#username').type('delete')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.get('#details').click()
      //cy.get('#delete').click()
      cy.contains('#delete').should('not.exist')
    })
    it.only('A blog can not be deleted by anyone else', function () {
      cy.get('#newBlog').click()
      cy.get('#title').type('most liked blog')
      cy.get('#author').type('most liked author')
      cy.get('#url').type('www.test.com')
      cy.get('#createBlog').click()
      cy.get('#details').click()
      cy.get('#addLike').click()

      cy.get('#newBlog').click()
      cy.get('#title').type('2nd most liked blog')
      cy.get('#author').type('2nd most liked author')
      cy.get('#url').type('www.test2.com')
      cy.get('#createBlog').click().wait(500)

      cy.get('.blog').eq(0).should('contain', 'most liked blog')
      cy.get('.blog').eq(2).should('contain', '2nd most liked blog')
    })
  })
})