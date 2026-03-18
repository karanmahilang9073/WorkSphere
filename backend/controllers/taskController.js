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