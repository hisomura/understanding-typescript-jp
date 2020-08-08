import { RequestHandler } from 'express'
import { Todo } from '../models/todos'

const TODOS: Todo[] = []

export const createTodo: RequestHandler = (req, res, next) => {
  const text = (req.body as { text: string }).text
  const newTodo = new Todo(Math.random().toString(), text)

  TODOS.push(newTodo)

  res.status(201).json({ message: 'TODO を作成しました。', createTodo: newTodo })
}

export const getTodos: RequestHandler = (req, res, next) => {
  res.json({todos: TODOS})
}

export const updateTodo: RequestHandler<{id: string}> = (req, res, next) => {
  const todoId = req.params.id
  const updateText = (req.body as {text: string}).text

  const todoIndex = TODOS.findIndex(todo => todo.id === todoId)
  if (todoIndex < 0 ) {
    throw new Error('TODO not found.')
  }
  TODOS[todoIndex].text = updateText

  res.json({message: 'updated', updatedTodo: TODOS[todoIndex]})
}

export const deleteTodo: RequestHandler<{id: string}> = (req, res, next) => {
  const todoId = req.params.id
  const updateText = (req.body as {text: string}).text

  const todoIndex = TODOS.findIndex(todo => todo.id === todoId)
  if (todoIndex < 0 ) {
    throw new Error('TODO not found.')
  }
  TODOS.splice(todoIndex, 1)
  res.json({message: 'deleted'})
}