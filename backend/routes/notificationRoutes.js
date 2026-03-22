import express from 'express'
import {createNotification, getMyNotifications, markAsRead ,markAllAsRead, deleteNotification} from '../controllers/notificationController.js'

const notificationRouter = express.Router()

notificationRouter.post('/create-notification', createNotification)
notificationRouter.get('/', getMyNotifications)
notificationRouter.put('/:id/read', markAsRead)
notificationRouter.put('/read-all', markAllAsRead)
notificationRouter.delete('/delete-notification/:id', deleteNotification)

export default notificationRouter