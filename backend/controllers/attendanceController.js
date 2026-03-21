import asyncHandler from "../middlewares/asyncHandler.js"
import Attendance from "../models/Attendance.js"

const getToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
}

const calculateHours = (checkIn, checkOut) => {
    const diff = checkOut - checkIn
    return diff/(1000*60*60)
}

export const checkIn = asyncHandler(async(req, res) => {
    const userId = req.user.id
    const today = getToday()
    const existing = await Attendance.findOne({ employee: userId, date: today})
    
    if(existing) {
        const error = new Error('already checked in today')
        error.statusCode = 400
        throw error
    }

    const now = new Date()
    let shiftStart = "10:00"
    let shiftEnd = "19:00"
    const hour = now.getHours()
    if (hour >= 22 || hour < 6) {
        shiftStart: "22:00"
        shiftEnd: "06:00"
    }
    const late = now.getHours() >10
    const attendance = await Attendance.create({
        employee: userId,
        date: today,
        checkIn: now,
        shiftStart,
        shiftEnd,
        late
    })
    res.status(201).json({ success: true, message: "check-in successful"}, attandence)
})

export const checkout= asyncHandler(async(req, res) => {
    const userId = req.user.id
    const today = getToday()
    const attendance = await Attendance.findOne({employee: userId, date: today})
    if (!attendance) {
        const error = new Error('check-in not found')
        error.statusCode = 404
        throw error
    }
    if (attendance.checkout) {
        const error = new Error('already checked out')
        error.statusCode = 400
        throw error
    }
    const now = new Date()
    attendance.checkOut = now

    const hours = calculateHours(attendance.checkIn, now)
    attendance.workHours = Number(hours.toFixed(2))

    //overtime
    if (attendance.workHours >8) {
        attendance.overtimeHours = Number((attendance.workHours - 8).toFixed(2))
    }
    await attendance.save()
     res.status(200).json({ success: true, message: "Check-out successful", attendance })
})

export const getMyAttendance = asyncHandler(async(req, res) => {
    const { month, year } = req.query
    const start = new Date(year, month -1, 1)
    const end = new Date(year, month, 0)
    const userId  = req.user.id
    const records = await Attendance.find({employee: userId, date: { $gte: start, $lte: end}}).sort({ date: 1 })
    res.status(200).json({ success: true, message: "check-out successful", attendance})
})

export const getAllAttendance = asyncHandler(async (req, res) => {
    const userId = req.user.role
    if ( userId === "employee") {
        const error = new Error("Not authorized")
        error.statusCode = 403
        throw error
    }
    const records = await Attendance
        .find()
        .populate("employee", "name email role")
        .sort({ date: -1 })

    res.status(200).json({ success: true, count: records.length, attendance: records})
})

export const markAbsent = asyncHandler(async (req, res) => {
    const { employeeId, date } = req.body
    if (!employeeId || !date) {
        const error = new Error("Employee and date required")
        error.statusCode = 400
        throw error
    }

    const existing = await Attendance.findOne({
        employee: employeeId,
        date: new Date(date)
    })

    if (existing) {
        const error = new Error("Attendance already exists")
        error.statusCode = 400
        throw error
    }

    const attendance = await Attendance.create({
        employee: employeeId,
        date: new Date(date),
        status: "absent"
    })

    res.status(201).json({
        success: true,
        message: "Marked as absent",
        attendance
    })
})
