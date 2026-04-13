import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import {createNotification, getMyNotifications, markAsRead ,markAllAsRead, deleteNotification} from '../controllers/notificationController.js'

const notificationRouter = express.Router()

notificationRouter.post('/', authMiddleware, createNotification)
notificationRouter.get('/my', authMiddleware, getMyNotifications)
notificationRouter.patch('/:id/read', authMiddleware, markAsRead)
notificationRouter.put('/read-all', authMiddleware, markAllAsRead)
notificationRouter.delete('/:id', authMiddleware, deleteNotification)

export default notificationRouter