import express from 'express'
import {createTask, getAllTasks, getTask, updateTask, updateStatus, deleteTask} from '../controllers/taskController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const taskRouter = express.Router()

taskRouter.post('/create-task', authMiddleware, createTask)
taskRouter.get('/', getAllTasks)
taskRouter.get('/:id', getTask)
taskRouter.put('/update-task/:id', authMiddleware, updateTask)
taskRouter.put('/update-status/:id/status', authMiddleware, updateStatus)
taskRouter.delete('/delete-task/:id', authMiddleware, deleteTask)

export default taskRouter