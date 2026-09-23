import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import {
    checkIn,
    checkout,
    getMyAttendance,
    getAllAttendance,
    markAbsent,
    generateQRToken,
    qrCheckIn,
    getOfficeLocationConfig,
    updateOfficeLocationConfig
} from '../controllers/attendanceController.js'

const attendanceRouter = express.Router()

attendanceRouter.post('/check-in', authMiddleware, checkIn)
attendanceRouter.post('/check-out', authMiddleware, checkout)
attendanceRouter.get('/my', authMiddleware, getMyAttendance)
attendanceRouter.get('/', authMiddleware, getAllAttendance)
attendanceRouter.post('/absent', authMiddleware, markAbsent)
attendanceRouter.post('/qr-token', authMiddleware, generateQRToken)
attendanceRouter.post('/qr-check-in', authMiddleware, qrCheckIn)
attendanceRouter.get('/office-location', authMiddleware, getOfficeLocationConfig)
attendanceRouter.put('/office-location', authMiddleware, updateOfficeLocationConfig)

export default attendanceRouter
