import asyncHandler from "../middlewares/asyncHandler.js";
import Leave from "../models/Leave.js";

export const applyLeave = asyncHandler(async(req, res) => {
    const {leaveType, startDate, endDate, reason } = req.body
    const employeeId = req.user.id
    if( !leaveType || !startDate || !endDate || !reason){
        const error = new Error("All Fields are required")
        error.statusCode = 400
        throw error
    }
    if(req.user.role !== 'Employee') {
        const error = new Error('only employee can apply for leave')
        error.statusCode = 403
        throw error
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if(end < start) {
        const error = new Error('end date cannot be before start date')
        error.statusCode = 400
        throw error
    }

    const existing = await Leave.findOne({employee : employeeId, 
        status : {$in : ['pending','approved']},
        $or : [{startDate : {$lte : end}, endDate : {$gte : start}}]
    })
    if(existing) {
        const error = new Error('you already applied leave for selected dates')
        error.statusCode = 409
        throw error
    }

    const leave = await Leave.create({
        employee: employeeId,
        leaveType,
        startDate : start,
        endDate : end,
        reason
    })
    res.status(201).json({success: true, message: 'leave applied successfully', leave})
})

export const getLeaves = asyncHandler(async (req, res) => {
    let leaves
    const employeeId = req.user.id 
    if(req.user.role === "Employee") {
        leaves = await Leave.find({employee : employeeId}).populate("employee", "name email role").sort({createdAt : -1})
    } else {
        leaves = await Leave.Find().populate("employee", "name email role").sort({createdAt : -1})
    }
    res.status(200).json({success: true, count: leaves.length, leaves})
})

export const updateLeaveStatus = asyncHandler(async(req, res) => {
    const { status, comment } = req.body
    const leaveId = req.params.id
    const leave = await Leave.findById(leaveId)
    if (!leave) {
        const error = new Error("leave not found")
        error.statusCode = 404
        throw error
    }
    if(!['Hr','Admin'].includes(req.user.role)) {
        const error = new Error('you are not authorized to update leave status')
        error.statusCode = 403
        throw error
    }
    if (!["approved","rejected"].includes(status)) {
        const error = new Error("invalid status")
        error.statusCode = 400
        throw error
    }
    if(leave.status !== 'pending') {
        const error = new Error('leave already requested')
        error.statusCode = 400
        throw error
    }

    leave.status = status
    leave.approvedBy = req.user.id
    leave.approvedComment = comment

    await leave.save()

    res.status(200).json({success: true, message: `leave ${status}`, leave})
})

export const revokeLeave = asyncHandler(async(req, res) => {
    const leaveId = req.params.id
    const leave = await Leave.findById(leaveId)
    if (!leave) {
        const error = new Error("leave not found")
        error.statusCode = 404
        throw error
    }
    if (leave.employee.toString() !== req.user.id) {
        const error = new Error("not authorized")
        error.statusCode = 403
        throw error
    }
    if (!["pending", "approved"].includes(leave.status)) {
        const error = new Error("cannot revoke this leave")
        error.statusCode= 400
        throw error
    }
    leave.status = "cancelled"
    await leave.save()

    res.status(200).json({success: true, message: 'leave revoked successfully', leave})
})

export const deleteLeave = asyncHandler(async(req, res) => {
    const leaveId = req.params.id
    const leave = await Leave.findById(leaveId)
    if(!leave) {
        const error = new Error("leave not found")
        error.statusCode= 404
        throw error
    }
    if(leave.employee.toString() !== req.user.id && !['Hr','Admin'].includes(req.user.role)) {
        const error = new Error('you are not authorized to delete leave')
        error.statusCode = 403
        throw error
    }
    if(leave.status !== "pending") {
        const error = new Error('only pending leave can be deleted')
    }
    await leave.deleteOne()
    res.status(200).json({success: true, message: "leave deleted successfully"})
})
