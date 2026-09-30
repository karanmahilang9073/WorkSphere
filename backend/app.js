import express from 'express'
import cors from 'cors'
import userRouter from './routes/userRoutes.js'
import authRouter from './routes/authRoutes.js'
import taskRouter from './routes/taskRoutes.js'
import salaryRouter from './routes/salaryRoutes.js'
import leaveRouter from './routes/leaveRoutes.js'
import attendanceRouter from './routes/attendanceRoutes.js'
import aiRouter from './routes/aiRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import analyticsRouter from './routes/analyticsRoutes.js'

const app = express()

app.use(express.json())

app.use(cors({
    origin : ['http://localhost:5173', 'https://work-sphere-sepia.vercel.app'],
    credentials : true,
}))

// basic response on browser
app.get('/', (req, res) => {
    res.send('backend running successfully')
})

// routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/salary', salaryRouter)
app.use('/api/leaves', leaveRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/ai', aiRouter)
app.use('/api/analytics', analyticsRouter)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success : false, message : 'route not found' })
})

// global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.statusCode || 500).json({ success : false, message : err.message || 'internal server error' })
})

export default app
