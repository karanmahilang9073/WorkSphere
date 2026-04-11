import express from 'express'
import {createTask, getAllTasks, getTask, updateTask, updateStatus, deleteTask} from '../controllers/taskController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const taskRouter = express.Router()

taskRouter.post('/create-task', authMiddleware, createTask)
taskRouter.get('/',authMiddleware, getAllTasks)
taskRouter.get('/:id',authMiddleware, getTask)
taskRouter.put('/update-task/:id', authMiddleware, updateTask)
taskRouter.put('/update-status/:id/status', authMiddleware, updateStatus)
taskRouter.delete('/delete-task/:id', authMiddleware, deleteTask)

export default taskRouter