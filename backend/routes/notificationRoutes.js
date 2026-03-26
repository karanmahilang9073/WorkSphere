import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import {createNotification, getMyNotifications, markAsRead ,markAllAsRead, deleteNotification} from '../controllers/notificationController.js'

const notificationRouter = express.Router()

notificationRouter.post('/create-notification', authMiddleware, createNotification)
notificationRouter.get('/', authMiddleware, getMyNotifications)
notificationRouter.put('/:id/read', authMiddleware, markAsRead)
notificationRouter.put('/read-all', authMiddleware, markAllAsRead)
notificationRouter.delete('/delete-notification/:id', authMiddleware, deleteNotification)

export default notificationRouter