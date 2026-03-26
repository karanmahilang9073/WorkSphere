import asyncHandler from "../middlewares/asyncHandler.js";
import Leave from "../models/Leave.js";

// Helper: calculate total days
const calculateDays = (startDate, endDate) => {
    const diff = new Date(endDate) - new Date(startDate)
    return Math.ceil(diff/(1000*60*60*24))+1
}

export const applyLeave = asyncHandler(async(req, res) => {
    const {leaveType, startDate, endDate, reason } = req.body
    if( !leaveType || !startDate || !endDate || !reason){
        const error = new Error("All Fields are required")
        error.statusCode = 400
        throw error
    }

    const totalDays =  calculateDays(startDate, endDate)

    const leave = await Leave.create({
        employee: req.user.id,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason
    })
    res.status(201).json({success: true, message: 'leave applied successfully', leave})
})

export const getLeaves = asyncHandler(async (req, res) => {
    let leaves
    if (req.user.role === "employee") {
        leaves = await Leave.find({ employee: req.user.id })
    } else {
        leaves = await Leave.find().populate("employee", "name email role")
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
    if (!["approved","rejected"].includes(status)) {
        const error = new Error("invalid status")
        throw error
    }

    leave.status = status
    leave.approvedBy = req.user.id
    leave.approvalComment = comment
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
    if (!["rejected", "cancelled"].includes(leave.status)) {
        const error = new Error("cannot revoke this leave")
        error.statusCode= 400
        throw error
    }
    leave.status = "cancelled"
    await leave.save()

    res.status(200).json({success: true, message: 'leave revoked succesfully', leave})
})

export const deleteLeave = asyncHandler(async(req, res) => {
    const leaveId = req.params.id
    const leave = await Leave.findById(leaveId)
    if(!leave) {
        const error = new Error("leave not found")
        error.statusCode= 404
        throw error
    }
    await leave.deleteOne()
    res.status(200).json({success: true, message: "leave deleted successfully"})
})
