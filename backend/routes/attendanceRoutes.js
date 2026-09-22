import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import {
    checkIn,
    checkout,
    getMyAttendance,
    getAllAttendance,
    markAbsent,
    generateQRToken,
    qrCheckIn
} from '../controllers/attendanceController.js'

const attendanceRouter = express.Router()

attendanceRouter.post('/check-in', authMiddleware, checkIn)
attendanceRouter.post('/check-out', authMiddleware, checkout)
attendanceRouter.get('/my', authMiddleware, getMyAttendance)
attendanceRouter.get('/', authMiddleware, getAllAttendance)
attendanceRouter.post('/absent', authMiddleware, markAbsent)
attendanceRouter.post('/qr-token', authMiddleware, generateQRToken)
attendanceRouter.post('/qr-check-in', authMiddleware, qrCheckIn)

export default attendanceRouter
