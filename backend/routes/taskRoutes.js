import express from 'express'
import {createTask, getAllTasks, getTask, updateTask, updateStatus, deleteTask} from '../controllers/taskController.js'

const taskRouter = express.Router()

router.post('/auth/', createTask)
router.get('/auth/', getAllTasks)
router.get('/auth/:id', getTask)
router.put('/auth/:id', updateStatus)
router.delete('/auth/:id', deleteTask)

export default taskRouter