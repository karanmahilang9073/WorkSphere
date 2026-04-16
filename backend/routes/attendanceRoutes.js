import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import {checkIn, checkout, getMyAttendance, getAllAttendance, markAbsent} from '../controllers/attendanceController.js'

const attendanceRouter = express.Router()

attendanceRouter.post('/check-in', authMiddleware, checkIn)
attendanceRouter.post('/check-out', authMiddleware, checkout)
attendanceRouter.get('/my',authMiddleware, getMyAttendance)
attendanceRouter.get('/', authMiddleware, getAllAttendance)
attendanceRouter.post('/absent', authMiddleware, markAbsent)

export default attendanceRouter
