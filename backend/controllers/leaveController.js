import asyncHandler from "../middlewares/asyncHandler.js";
import Leave from "../models/Leave.js";
import { leaveApprovedMail, leaveRejectedMail } from "../services/emailService.js";


export const applyLeave = asyncHandler(async(req, res) => {
    const {leaveType, startDate, endDate, reason } = req.body
    
    const employeeId = req.user._id
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

    await leave.save()
    await leave.populate('employee', "name email")

    res.status(201).json({success: true, message: 'leave applied successfully', leave})
})

export const getLeaves = asyncHandler(async (req, res) => {
    let leaves
    const employeeId = req.user._id 

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    let totalRecords

    if(req.user.role === "Employee") {
        totalRecords = await Leave.countDocuments({employee: employeeId})
        leaves = await Leave.find({employee : employeeId}).populate("employee", "name email role department").sort({createdAt : -1})
    } else {
        totalRecords = await Leave.countDocuments();
        leaves = await Leave.find().populate("employee", "name email role department").sort({createdAt : -1}).skip(skip).limit(limit)
    }
    res.status(200).json({success: true, leaves, currentPage: page, totalPages: Math.ceil(totalRecords / limit), totalRecords})
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
    if(!['HR','Admin'].includes(req.user.role)) {
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
    
    leave.approvedBy = req.user._id
    leave.approvedComment = comment

    await leave.save()
    await leave.populate("employee", "name email role department")

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
    
    if (leave.employee.toString() !== req.user._id.toString()) {
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
    
    if(leave.employee.toString() !== req.user._id.toString() && !['HR','Admin'].includes(req.user.role)) {
        const error = new Error('you are not authorized to delete leave')
        error.statusCode = 403
        throw error
    }
    if(leave.status !== "pending") {
        const error = new Error('only pending leave can be deleted')
        error.statusCode = 400
        throw error
    }
    await leave.deleteOne()
    res.status(200).json({success: true, message: "leave deleted successfully"})
})
