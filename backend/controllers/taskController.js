import asyncHandler from "../middlewares/asyncHandler.js";
import Task from "../models/Task.js";


export const createTask = asyncHandler(async(req, res) => {
    const {title, description, assignedTo, deadline} = req.body
    if(!title || !assignedTo){
        const error = new Error('title and assignedTo field is required')
        error.statusCode = 401
        throw error
    }

    const task = await Task.create({title, description, assignedTo, deadline})
    await task.populate("assignedTo", "name email")

    res.status(201).json({success : true, message : "task created successfully", task})
})

export const getAllTasks = asyncHandler(async(req, res) => {
    const tasks = await Task.find().populate("assignedTo", "name email")

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

    res.status(200).json({success : true, data : task})
})

export const updateTask = asyncHandler(async(req, res) => {
    const {title, description, deadline} = req.body
    const taskId = req.params.id
    if(!taskId){
        const error = new Error('task ID is required for updation')
        error.statusCode = 400
        throw error
    }

    const updateData = {
        ...(title && {title}),
        ...(description && {description}),
        ...(deadline && {deadline}),
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {new : true, runValidators : true}).populate("assignedTo", "name email")

    if(!updatedTask){
        const error = new Error("task not found")
        error.statusCode = 404
        throw error
    }

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

    const validStatus = ['pending','inProgress','missed','completed']
    if(!validStatus.includes(status)){
        const error = new Error('invalid status value')
        error.statusCode = 400
        throw error
    }

    const updatedStatus = await Task.findByIdAndUpdate(taskId, {status}, {new : true, runValidators : true}).populate("assignedTo", "name email")
    if(!updatedStatus){
        const error = new Error('no task found')
        error.statusCode = 404
        throw error
    }

    res.status(200).json({success : true, data : updatedStatus})
})

export const deleteTask = asyncHandler(async(req, res) => {
    const taskId = req.params.id 
    const task = await Task.findById(taskId)
    if(!task){
        const error = new Error('task not found')
        error.statusCode = 404
        throw error
    }

    await Task.findByIdAndDelete(taskId)

    res.status(200).json({success : true, message : 'task deleted successfully'})
})