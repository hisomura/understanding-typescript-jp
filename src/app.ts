import express, {ErrorRequestHandler} from 'express'
import {json} from "body-parser";
import todoRotes from './routes/todos'

const app = express()

app.use(json())

app.use('/todos', todoRotes)

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({message: err.message})
}
app.use(errorHandler)

app.listen(3000)