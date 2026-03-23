import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { analyzeAttendance, analyzeLeavereq, getPerformanceInsights, predictSalary, recommendTasks } from '../controllers/aiController.js'

const aiRouter = express.Router()

aiRouter.post('/predict-salary', authMiddleware, predictSalary)
aiRouter.post('/recommend-tasks', authMiddleware, recommendTasks)
aiRouter.post('/analyze-leave', authMiddleware, analyzeLeavereq)
aiRouter.get('/performance-insights', authMiddleware, getPerformanceInsights)
aiRouter.get('/analyze-attendance', authMiddleware, analyzeAttendance)


export default aiRouter