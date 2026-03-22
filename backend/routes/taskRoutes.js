import express from 'express'
import {createTask, getAllTasks, getTask, updateTask, updateStatus, deleteTask} from '../controllers/taskController.js'

const taskRouter = express.Router()

taskRouter.post('/auth/', createTask)
taskRouter.get('/auth/', getAllTasks)
taskRouter.get('/auth/:id', getTask)
taskRouter.put('/auth/:id', updateTask)
taskRouter.put('/auth/:id/status', updateStatus)
taskRouter.delete('/auth/:id', deleteTask)

export default taskRouter