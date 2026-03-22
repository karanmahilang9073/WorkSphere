import express from 'express'
import {checkIn, checkout, getMyAttendance, getAllAttendance, markAbsent} from '../controllers/attendanceController.js'

const attendanceRouter = express.Router()

attendanceRouter.post('/auth/check-in', checkIn)
attendanceRouter.post('/auth/check-out', checkout)
attendanceRouter.get('/auth/me', getMyAttendance)
attendanceRouter.get('/auth/', getAllAttendance)
attendanceRouter.post('/auth/absent', markAbsent)

export default attendanceRouter
