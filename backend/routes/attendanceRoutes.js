import express from 'express'
import {checkIn, checkout, getMyAttendance, getAllAttendance, markAbsent} from '../controllers/attendanceController.js'

const attendanceRouter = express.Router()

attendanceRouter.post('/check-in', checkIn)
attendanceRouter.post('/check-out', checkout)
attendanceRouter.get('/me', getMyAttendance)
attendanceRouter.get('/', getAllAttendance)
attendanceRouter.post('/absent', markAbsent)

export default attendanceRouter
