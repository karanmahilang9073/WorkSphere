import asyncHandler from "../middlewares/asyncHandler.js"
import Notification from "../models/Notification.js"

export const createNotification = asyncHandler(async(req, res) => {
    const { recipient, type, title, message } = req.body
    if (!recipient || !title || !message) {
        const error = new Error('all fields are required')
        error.statusCode = 400
        throw error
    }
    const notification = await Notification.create({ recipient, type: type || "task", title, message})
    res.status(201).json({ success: true, message: "notification created successfully", notification})
})

export const getMyNotifications = asyncHandler(async(req, res) => {
    const notificationsId = req.user._id
    const notifications = await Notification.find({ recipient: notificationsId}).sort({createdAt: -1})
    res.status(200).json({ success: true, count: notifications.length, notifications})
})

export const markAsRead = asyncHandler(async(req, res) => {
    const notificationId = req.params.id
    const notification = await Notification.findById(notificationId)
    if (!notification) {
        const error = new Error('notification not found')
        error.statusCode = 404
        throw error
    }
    const userId = req.user._id
    if(notification.recipient.toString() !== userId) {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    notification.isRead = true
    await notification.save()
    res.status(200).json({ success: true, message: "notification marked as read", notification})
})

export const markAllAsRead = asyncHandler(async(req, res) => {
    const notificationId = req.user._id
    await Notification.updateMany({ recipient: notificationId, isRead: false}, {isRead: true})
    res.status(200).json({ success: true, message: "all notification marked as read"})
})

export const deleteNotification = asyncHandler(async(req, res) => {
    const notificationId = req.params.id
    const notification = await Notification.findById(notificationId)
    if(!notification) {
        const error = new Error('notification not found')
        error.statusCode = 404
        throw error
    }
    const userId = req.user._id
    const adminId = req.user.role
    if(notification.recipient.toString() !== userId && adminId !== "admin") {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    await notification.deleteOne()
    res.status(200).json({ success: true, message: "notification deleted successfully"})
})