import asyncHandler from "../middlewares/asyncHandler.js"
import Attendance from "../models/Attendance.js"
import OfficeLocation from "../models/OfficeLocation.js"
import JWT from "jsonwebtoken"

const getActiveOfficeLocation = async () => {
    const customLoc = await OfficeLocation.findOne().sort({ updatedAt: -1 })
    if (customLoc) {
        return {
            latitude: customLoc.latitude,
            longitude: customLoc.longitude,
            radiusMeters: customLoc.radiusMeters || 500,
            address: customLoc.address || "Corporate Office",
            name: customLoc.name || "Main Office"
        }
    }
    const envLat = process.env.OFFICE_LAT ? parseFloat(process.env.OFFICE_LAT) : null
    const envLng = process.env.OFFICE_LNG ? parseFloat(process.env.OFFICE_LNG) : null
    const envRadius = process.env.OFFICE_RADIUS_METERS ? parseFloat(process.env.OFFICE_RADIUS_METERS) : 500
    if (envLat !== null && envLng !== null) {
        return {
            latitude: envLat,
            longitude: envLng,
            radiusMeters: envRadius,
            address: "Office Geo-Fence",
            name: "Main Office"
        }
    }
    return null
}

const getToday = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return start
}

const calculateHours = (checkIn, checkOut) => {
    const diff = checkOut - checkIn
    return diff / (1000 * 60 * 60)
}

// Haversine formula to compute distance in meters
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180
    const phi2 = (lat2 * Math.PI) / 180
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

// Dynamic Shift Helper
const resolveShift = (now, timezoneOffset) => {
    let d = now
    if (typeof timezoneOffset === 'number' && !isNaN(timezoneOffset)) {
        d = new Date(now.getTime() - timezoneOffset * 60000)
    }
    const hour = typeof timezoneOffset === 'number' ? d.getUTCHours() : d.getHours()
    if (hour >= 6 && hour < 12) {
        return { type: "Morning", start: "08:00", startHour: 8, startMin: 0, end: "17:00", shiftEnum: "morning" }
    } else if (hour >= 12 && hour < 17) {
        return { type: "General", start: "10:00", startHour: 10, startMin: 0, end: "19:00", shiftEnum: "general" }
    } else if (hour >= 17 && hour < 22) {
        return { type: "Evening", start: "14:00", startHour: 14, startMin: 0, end: "23:00", shiftEnum: "evening" }
    } else {
        return { type: "Night", start: "22:00", startHour: 22, startMin: 0, end: "06:00", shiftEnum: "night" }
    }
}

export const checkIn = asyncHandler(async (req, res) => {
    if (req.user.role?.toLowerCase() !== "employee") {
        const error = new Error('only employees can checkIn')
        error.statusCode = 403
        throw error
    }

    const userId = req.user._id
    const { location, timezoneOffset } = req.body

    if (!location?.latitude || !location?.longitude) {
        const error = new Error('GPS location is required for check-in. Please enable location access or scan the Office QR Code.')
        error.statusCode = 400
        throw error
    }

    // Dynamic Geo-fencing verification from Admin settings or env fallback
    const office = await getActiveOfficeLocation()
    if (office && office.latitude !== null && office.longitude !== null) {
        const distance = calculateDistanceMeters(location.latitude, location.longitude, office.latitude, office.longitude)
        if (distance > office.radiusMeters) {
            const error = new Error(`Out of office range (${Math.round(distance)}m away from ${office.name}). Allowed radius is ${office.radiusMeters}m. Please use Office QR Code scan.`)
            error.statusCode = 400
            throw error
        }
    }

    const start = getToday()
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const existing = await Attendance.findOne({ employee: userId, date: { $gte: start, $lt: end } })
    if (existing) {
        const error = new Error('already checked in today')
        error.statusCode = 400
        throw error
    }

    const now = new Date()
    const shift = resolveShift(now, timezoneOffset)
    let localDate = now
    if (typeof timezoneOffset === 'number' && !isNaN(timezoneOffset)) {
        localDate = new Date(now.getTime() - timezoneOffset * 60000)
    }
    const localHour = typeof timezoneOffset === 'number' ? localDate.getUTCHours() : localDate.getHours()
    const localMin = typeof timezoneOffset === 'number' ? localDate.getUTCMinutes() : localDate.getMinutes()
    const late = localHour > shift.startHour || (localHour === shift.startHour && localMin > shift.startMin)

    const attendance = await Attendance.create({
        employee: userId,
        date: start,
        checkIn: now,
        shift: shift.shiftEnum,
        shiftType: shift.type,
        shiftStart: shift.start,
        shiftEnd: shift.end,
        late,
        checkInMethod: "geofence",
        location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address || "Office Geo-Fence"
        }
    })

    res.status(201).json({ success: true, message: 'Geo-verified check-in successful', attendance })
})

export const checkout = asyncHandler(async (req, res) => {
    if (req.user.role?.toLowerCase() !== "employee") {
        const error = new Error('only employee can check out')
        error.statusCode = 403
        throw error
    }

    const userId = req.user._id

    const start = getToday()
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const attendance = await Attendance.findOne({ employee: userId, date: { $gte: start, $lt: end } })
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
    if (!attendance.checkIn) {
        const error = new Error('invalid check-in record')
        error.statusCode = 400
        throw error
    }

    const now = new Date()
    attendance.checkOut = now

    const hours = calculateHours(attendance.checkIn, now)
    attendance.workHours = Number(hours.toFixed(2))

    // Determine status based on duration
    if (attendance.workHours < 1) {
        attendance.status = "incomplete"
    } else if (attendance.workHours < 4) {
        attendance.status = "half-day"
    } else {
        attendance.status = "present"
    }

    // Overtime calculation (Standard 8 working hours threshold)
    const OVERTIME_THRESHOLD = 8
    if (attendance.workHours > OVERTIME_THRESHOLD) {
        attendance.overtimeHours = Number((attendance.workHours - OVERTIME_THRESHOLD).toFixed(2))
    } else {
        attendance.overtimeHours = 0
    }

    await attendance.save()
    res.status(200).json({ success: true, message: 'Check-out successful', attendance })
})

// Generate dynamic QR Code token for office kiosk (HR/Admin only)
export const generateQRToken = asyncHandler(async (req, res) => {
    if (!["Admin", "HR"].includes(req.user.role)) {
        const error = new Error('unauthorized')
        error.statusCode = 403
        throw error
    }

    const token = JWT.sign(
        { type: "attendance_qr", generatedBy: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "90s" }
    )

    res.status(200).json({ success: true, qrToken: token, expiresInSeconds: 90 })
})

// Check-in via QR Code scan (Employee)
export const qrCheckIn = asyncHandler(async (req, res) => {
    if (req.user.role?.toLowerCase() !== "employee") {
        const error = new Error('only employees can check in')
        error.statusCode = 403
        throw error
    }

    const { qrToken, location, timezoneOffset } = req.body
    if (!qrToken) {
        const error = new Error('QR token is required')
        error.statusCode = 400
        throw error
    }

    try {
        const decoded = JWT.verify(qrToken, process.env.JWT_SECRET)
        if (decoded.type !== "attendance_qr") {
            const error = new Error('invalid attendance QR token')
            error.statusCode = 400
            throw error
        }
    } catch {
        const error = new Error('QR code has expired or is invalid. Please scan again.')
        error.statusCode = 400
        throw error
    }

    const userId = req.user._id
    const start = getToday()
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const existing = await Attendance.findOne({ employee: userId, date: { $gte: start, $lt: end } })
    if (existing) {
        const error = new Error('already checked in today')
        error.statusCode = 400
        throw error
    }

    const now = new Date()
    const shift = resolveShift(now, timezoneOffset)
    let localDate = now
    if (typeof timezoneOffset === 'number' && !isNaN(timezoneOffset)) {
        localDate = new Date(now.getTime() - timezoneOffset * 60000)
    }
    const localHour = typeof timezoneOffset === 'number' ? localDate.getUTCHours() : localDate.getHours()
    const localMin = typeof timezoneOffset === 'number' ? localDate.getUTCMinutes() : localDate.getMinutes()
    const late = localHour > shift.startHour || (localHour === shift.startHour && localMin > shift.startMin)

    const attendance = await Attendance.create({
        employee: userId,
        date: start,
        checkIn: now,
        shift: shift.shiftEnum,
        shiftType: shift.type,
        shiftStart: shift.start,
        shiftEnd: shift.end,
        late,
        checkInMethod: "qr",
        location: location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address || "Office QR Kiosk"
        } : { address: "Office QR Kiosk" }
    })

    res.status(201).json({ success: true, message: 'QR check-in successful', attendance })
})

export const getMyAttendance = asyncHandler(async (req, res) => {
    if (req.user.role !== "Employee") {
        const error = new Error('only employee can view their attendance')
        error.statusCode = 403
        throw error
    }
    let { month, year } = req.query
    month = parseInt(month)
    year = parseInt(year)
    if (!month || !year || month < 1 || month > 12 || isNaN(year)) {
        const error = new Error('invalid month (1-12) and year required')
        error.statusCode = 400
        throw error
    }
    // date range
    const start = new Date(year, month - 1, 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date(year, month, 0)
    end.setHours(23, 59, 59, 999)

    const userId = req.user._id
    const records = await Attendance.find({ employee: userId, date: { $gte: start, $lt: end } })
        .populate('employee', 'name department')
        .sort({ date: -1 })

    // Auto-heal historical records for consistent status and shift classification
    for (const r of records) {
        let changed = false
        if (r.checkOut && r.status === 'present') {
            if (r.workHours < 1) {
                r.status = 'incomplete'
                changed = true
            } else if (r.workHours < 4) {
                r.status = 'half-day'
                changed = true
            }
        }
        if (r.checkIn && r.shiftType === 'Night') {
            const checkInDate = new Date(r.checkIn)
            // If checkIn was during morning IST (06:00 to 12:00)
            const istHours = (checkInDate.getUTCHours() + 5 + Math.floor((checkInDate.getUTCMinutes() + 30) / 60)) % 24
            if (istHours >= 6 && istHours < 12) {
                r.shiftType = 'Morning'
                r.shift = 'morning'
                r.shiftStart = '08:00'
                r.shiftEnd = '17:00'
                changed = true
            }
        }
        if (changed) {
            await r.save()
        }
    }

    res.status(200).json({ success: true, message: 'attendance record retrieved', count: records.length, records })
})

export const getAllAttendance = asyncHandler(async (req, res) => {
    if (!["Admin", "HR"].includes(req.user.role)) {
        const error = new Error('unauthorized')
        error.statusCode = 403
        throw error
    }
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const records = await Attendance.find()
        .populate('employee', 'name email role department')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()

    const total = await Attendance.countDocuments()

    res.status(200).json({
        success: true,
        attendance: records,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total
    })
})

export const markAbsent = asyncHandler(async (req, res) => {
    const { employeeId, date } = req.body
    if (!employeeId || !date) {
        const error = new Error('employee and date required')
        error.statusCode = 400
        throw error
    }

    if (!['HR', 'Admin'].includes(req.user.role)) {
        const error = new Error('unauthorized to mark absent')
        error.statusCode = 403
        throw error
    }

    const selectDate = new Date(date)
    if (isNaN(selectDate)) {
        const error = new Error('invalid date')
        error.statusCode = 400
        throw error
    }
    selectDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(selectDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const existing = await Attendance.findOne({
        employee: employeeId,
        date: { $gte: selectDate, $lt: nextDay }
    })

    if (existing) {
        const error = new Error('attendance already exists')
        error.statusCode = 400
        throw error
    }

    const attendance = await Attendance.create({ employee: employeeId, date: selectDate, status: 'absent' })

    res.status(201).json({ success: true, message: 'marked as absent', attendance })
})

// Get Office Location Config (Authenticated users)
export const getOfficeLocationConfig = asyncHandler(async (req, res) => {
    const office = await getActiveOfficeLocation()
    res.status(200).json({ success: true, office: office || null })
})

// Update Office Location Config (Admin/HR only)
export const updateOfficeLocationConfig = asyncHandler(async (req, res) => {
    if (!["Admin", "HR"].includes(req.user.role)) {
        const error = new Error('unauthorized')
        error.statusCode = 403
        throw error
    }

    const { latitude, longitude, radiusMeters, address, name } = req.body
    if (latitude === undefined || longitude === undefined) {
        const error = new Error('Latitude and Longitude are required')
        error.statusCode = 400
        throw error
    }

    let office = await OfficeLocation.findOne()
    if (office) {
        office.latitude = parseFloat(latitude)
        office.longitude = parseFloat(longitude)
        if (radiusMeters) office.radiusMeters = parseFloat(radiusMeters)
        if (address) office.address = address
        if (name) office.name = name
        office.updatedBy = req.user._id
        await office.save()
    } else {
        office = await OfficeLocation.create({
            name: name || "Main Office",
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radiusMeters: radiusMeters ? parseFloat(radiusMeters) : 500,
            address: address || "Corporate Office",
            updatedBy: req.user._id
        })
    }

    res.status(200).json({ success: true, message: 'Office location updated successfully', office })
})
