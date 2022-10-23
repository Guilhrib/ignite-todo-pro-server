const express = require('express')
const { json } = require('express/lib/response')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(express.json())

const users = []

function checkExistsUserAccount (req, res, next) {
  const { username } = req.headers

  const user = users.find(user => user.username === username)

  if (!user) res.status(404).json({ error: 'User not found!' })

  req.user = user
  next()
}

function checkExistsUserTodo (req, res, next) {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) res.status(404).json({ error: 'Tasks not found!' })

  req.todo = todo
  next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userAlreadyExist = users.some(user => user.username === username)
  if (userAlreadyExist) res.status(404).json({ error: 'User already exist!' })

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  res.status(201).json(user)
})

app.post('/todos', checkExistsUserAccount, (req, res) => {
  const { user } = req
  const { title, deadline } = req.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)
  res.status(201).json(todo)
})

app.get('/todos', checkExistsUserAccount, (req, res) => {
  const { user } = req
  res.json(user.todos)
})

app.put('/todos/:id', checkExistsUserAccount, checkExistsUserTodo, (req, res) => {
  const { todo } = req
  const { title, deadline } = req.body

  todo.title = title
  todo.deadline = new Date(deadline)

  res.status(204).json(todo)
})

app.patch('/todos/:id/done', checkExistsUserAccount, checkExistsUserTodo, (req, res) => {
  const { todo } = req

  todo.done = true

  res.status(204).json(todo)
})

app.delete('/todos/:id', checkExistsUserAccount, checkExistsUserTodo, (req, res) => {
  const { user, todo } = req

  user.todos.splice(todo, 1)

  res.status(204).json(user.todos)
})

app.listen(3333)