import asyncHandler from "../middlewares/asyncHandler.js"
import Notification from "../models/Notification.js"
import User from "../models/User.js"

export const createNotification = asyncHandler(async(req, res) => {
    const { recipient, type, title, message } = req.body
    if (!recipient || !title || !message) {
        const error = new Error('all fields are required')
        error.statusCode = 400
        throw error
    }
    if(!['Hr','Admin','hr','admin'].includes(req.user.role)) {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    const user = await User.findById(recipient)
    if(!user) {
        const error = new Error('recipient not found')
        error.statusCode= 404
        throw error
    }
    const validType = ['leave','task','salary']
    if(type && !validType.includes(type)) {
        const error = new Error('invalid notification type')
        error.statusCode = 400
        throw error
    }
    const notification = await Notification.create({ recipient, type: type || "task", title, message})
    res.status(201).json({ success: true, message: "notification created successfully", notification})
})

export const getMyNotifications = asyncHandler(async(req, res) => {
    const userId = req.user.id
    const notifications = await Notification.find({ recipient: userId}).sort({createdAt: -1})
    res.status(200).json({ success: true, message : 'notification fetched successfully', count: notifications.length, notifications})
})

export const markAsRead = asyncHandler(async(req, res) => {
    const notificationId = req.params.id
    const notification = await Notification.findByIdAndUpdate(
        { _id : notificationId, recipient : req.user.id}, 
        {isRead : true}, 
        {new : true})
    if (!notification) {
        const error = new Error('notification not found or not authorized')
        error.statusCode = 404
        throw error
    }
    res.status(200).json({ success: true, message: "notification marked as read", notification})
})

export const markAllAsRead = asyncHandler(async(req, res) => {
    const userId = req.user.id
    await Notification.updateMany({ recipient: userId, isRead: false}, {isRead: true})
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
    if(notification.recipient.toString() !== req.user.id && !['Admin','Hr'].includes(req.user.role)) {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    await notification.deleteOne()
    res.status(200).json({ success: true, message: "notification deleted successfully"})
})