import asyncHandler from "../middlewares/asyncHandler.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";


export const createTask = asyncHandler(async(req, res) => {
    const {title, description, assignedTo, deadline} = req.body
    if(!title || !assignedTo){
        const error = new Error('title and assignedTo field is required')
        error.statusCode = 400
        throw error
    }

    const user = await User.findById(assignedTo)
    if(!user) {
        const error = new Error('assigned user not found')
        error.statusCode = 404
        throw error
    }

    if(!['Hr','Admin','hr','admin'].includes(req.user.role)){
        const error = new Error('not authorized to create task')
        error.statusCode = 403
        throw error
    }

    const task = await Task.create({title, description, assignedTo, deadline})
    await task.populate("assignedTo", "name email")

    await Notification.create({
        recipient : assignedTo,
        type : 'task',
        title : 'new task assigned',
        message : `new task assigned: ${title}`
    })

    res.status(201).json({success : true, message : "task created successfully", task})
})

export const getAllTasks = asyncHandler(async(req, res) => {
    let tasks 
    if(['Hr','Admin','hr','admin'].includes(req.user.role)){
        tasks = await Task.find().populate("assignedTo", "name email").sort({createdAt : -1})
    } else {
        tasks = await Task.find({assignedTo : req.user._id}).populate("assignedTo", "name email").sort({createdAt : -1})
    }

    res.status(200).json({success: true, message : 'all tasks fetched successfully', count : tasks.length, data : tasks})
})

export const getTask =  asyncHandler(async(req, res) => {
    const taskId = req.params.id 
    const task = await Task.findById(taskId).populate("assignedTo", "name email")
    if(!task){
        const error = new Error("task not found")
        error.statusCode = 404
        throw error
    }
    if(!['Hr','Admin','hr','admin'].includes(req.user.role) && task.assignedTo.toString() !== req.user._id.toString()){
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }

    res.status(200).json({success : true, message : 'task fetched successfully', data : task})
})

export const updateTask = asyncHandler(async(req, res) => {
    const {title, description, deadline} = req.body
    const taskId = req.params.id
    if(!taskId){
        const error = new Error('task ID is required for updation')
        error.statusCode = 400
        throw error
    }
    
    const task = await Task.findById(taskId)
    if(!task) {
        const error = new Error('task not found')
        error.statusCode = 404
        throw error
    }
    if(!['Hr','Admin','hr','admin'].includes(req.user.role) && task.assignedTo.toString() !== req.user._id.toString()) {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }

    const updateData = {
        ...(title && {title}),
        ...(description && {description}),
        ...(deadline && {deadline : new Date(deadline)}),
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {returnDocument : 'after', runValidators : true}).populate("assignedTo", "name email")
    res.status(200).json({success : true, message : "task updated successfully", data : updatedTask})
})

export const updateStatus = asyncHandler(async(req, res) => {
    const taskId = req.params.id
    const {status} = req.body
    if(!taskId || !status){
        const error = new Error('status and taskId is required')
        error.statusCode = 400
        throw error
    }

    const task = await Task.findById(taskId)
    if(!task) {
        const error = new Error('task not found')
        error.statusCode = 404
        throw error
    }
    if(!['Hr','Admin','hr','admin'].includes(req.user.role) && task.assignedTo.toString() !== req.user._id.toString()){
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }

    const validStatus = ['pending','inProgress','missed','completed']
    if(!validStatus.includes(status)){
        const error = new Error('invalid status value')
        error.statusCode = 400
        throw error
    }

    const updatedStatus = await Task.findByIdAndUpdate(taskId, {status}, {returnDocument : 'after', runValidators : true}).populate("assignedTo", "name email")

    await Notification.create({
        recipient : updatedStatus.assignedTo,
        type : 'task',
        title : 'task status updated',
        message : `your task status has been updated to: ${status}`
    })
    
    res.status(200).json({success : true, message : 'task status updated successfullt', data : updatedStatus})
})

export const deleteTask = asyncHandler(async(req, res) => {
    const taskId = req.params.id 
    const task = await Task.findById(taskId)
    if(!task){
        const error = new Error('task not found')
        error.statusCode = 404
        throw error
    }
    if(!['Hr','Admin','hr','admin'].includes(req.user.role) && task.assignedTo.toString() !== req.user._id.toString()){
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    await task.deleteOne()
    res.status(200).json({success : true, message : 'task deleted successfully'})
})