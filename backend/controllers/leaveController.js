import asyncHandler from "../middlewares/asyncHandler";
import Leave from "../models/Leave";

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

    res.status(200).json({
        success: true,
        count: leaves.length,
        leaves
    })
})
