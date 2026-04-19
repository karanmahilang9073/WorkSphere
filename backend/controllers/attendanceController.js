import asyncHandler from "../middlewares/asyncHandler.js"
import Attendance from "../models/Attendance.js"

const getToday = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return start
}

const calculateHours = (checkIn, checkOut) => {
    const diff = checkOut - checkIn
    return diff/(1000*60*60)
}

export const checkIn = asyncHandler(async(req, res) => {
    if(req.user.role !== "Employee") {
        const error = new Error('only employees can checkIn')
        error.statusCode = 403
        throw error
    }
    
    const userId = req.user._id

    const start =  getToday()
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const existing = await Attendance.findOne({employee : userId, date : {$gte : start, $lt : end}})
    if(existing) {
        const error = new Error('already checked in today')
        error.statusCode = 400
        throw error
    }

    const now = new Date()
    const hour = now.getHours()

    const shifts = {
        day : {start : '10:00', startHour : 10, startMin : 0, end : '19:00'},
        night : {start : '22:00', startHour : 22, startMin : 0, end : '06:00'},
    }

    // determine night shift dynamically
    const isNightShift = hour >= 22 || hour < 6
    const shift = isNightShift ? shifts.night : shifts.day

    const late = hour > shift.startHour || (hour === shift.startHour && now.getMinutes() > shift.startMin)
    
    const attendance = await Attendance.create({
        employee: userId,
        date: start,
        checkIn: now,
        shiftStart : shift.start,
        shiftEnd : shift.end,
        late
    })
    res.status(201).json({ success: true, message: 'check-in successful', attendance})
})

export const checkout= asyncHandler(async(req, res) => {
    if(req.user.role !== "Employee") {
        const error = new Error('only employee can check out')
        error.statusCode = 403
        throw error
    }
   
    const userId = req.user._id

    const start = getToday()
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const attendance = await Attendance.findOne({employee: userId, date: {$gte : start, $lt : end}})
    if (!attendance) {
        const error = new Error('check-in not found')
        error.statusCode = 404
        throw error
    }
    if (attendance.checkOut) {
        const error = new Error('already checked out')
        error.statusCode = 400
        throw error
    }
    if(!attendance.checkIn) {
        const error = new Error('inalid check-in record')
        error.statusCode = 400
        throw error
    }

    const now = new Date()
    attendance.checkOut = now

    const hours = calculateHours(attendance.checkIn, now)
    attendance.workHours = Number(hours.toFixed(2))

    //overtime
    const OVERTME_THRESHOLD = 8
    if (attendance.workHours > OVERTME_THRESHOLD) {
        attendance.overtimeHours = Number((attendance.workHours - OVERTME_THRESHOLD).toFixed(2))
    }
    await attendance.save()
     res.status(200).json({ success: true, message: 'Check-out successful', attendance })
})

export const getMyAttendance = asyncHandler(async(req, res) => {
    if(req.user.role !== "Employee") {
        const error = new Error('only employee can view their attendance')
        error.statusCode = 403
        throw error
    }
    let { month, year } = req.query
    month = parseInt(month)
    year = parseInt(year)
    if(!month || !year || month < 1 || month > 12 || isNaN(year)){
        const error = new Error('invalid month (1-12) ans year required')
        error.statusCode = 400
        throw error
    }
    // date range
    const start = new Date(year, month -1, 1)
    start.setHours(0,0,0,0)
    const end = new Date(year, month, 0)
    end.setHours(23, 59, 59, 999)

   const userId  = req.user._id
    const records = await Attendance.find({employee: userId, date: { $gte: start, $lt: end}}).sort({ date: 1 })
    res.status(200).json({ success: true, message: 'attendance record retrieved', count : records.length, records})
})

export const getAllAttendance = asyncHandler(async(req, res) => {
    if (!["Admin","Hr"].includes(req.user.role)) {
        const error = new Error('Not authorized')
        error.statusCode = 403
        throw error
    }
    const records = await Attendance.find().populate('employee', 'name email role department').sort({ date: -1 }).lean()

    res.status(200).json({success: true, count: records.length, attendance: records})
})

export const markAbsent = asyncHandler(async (req, res) => {
    const { employeeId, date } = req.body
    if (!employeeId || !date) {
        const error = new Error('employee and date required')
        error.statusCode = 400
        throw error
    }

    if(!['Hr','Admin'].includes(req.user.role)) {
        const error = new Error('not authorized to mark absent')
        error.statusCode = 403
        throw error
    }

    const selectDate = new Date(date)
    if(isNaN(selectDate)) {
        const error = new Error('invalid date')
        error.statusCode = 400
        throw error
    }
    selectDate.setHours(0,0,0,0)

    const nextDay = new Date(selectDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const existing = await Attendance.findOne({
        employee: employeeId,
        date: {$gte : selectDate, $lt : nextDay}
    })

    if (existing) {
        const error = new Error('attendance already exists')
        error.statusCode = 400
        throw error
    }

    const attendance = await Attendance.create({employee: employeeId, date: selectDate, status: 'absent'})

    res.status(201).json({success: true, message: 'marked as absent', attendance})
})
