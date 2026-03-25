import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import dns from 'dns'
import userRouter from './routes/userRoutes.js'
import authRouter from './routes/authRoutes.js'
import taskRouter from './routes/taskRoutes.js'
import salaryRouter from './routes/salaryRoutes.js'
import leaveRouter from './routes/leaveRoutes.js'
import attendanceRouter from './routes/attendanceRoutes.js'
import aiRouter from './routes/aiRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import cors from 'cors'
import http from 'http'
import { initSocket } from './config/socket.js'

dns.setDefaultResultOrder("ipv4first");

dotenv.config()
const app = express()
app.use(express.json())

const server = http.createServer(app)

app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,
}))

const PORT = process.env.PORT || 7000


// basic response on browser
app.get('/', (req, res)=> {
    res.send('backend running successfully')
})


//database call
connectDB()

// routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/salary', salaryRouter)
app.use('/api/leaves', leaveRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/ai', aiRouter)

//socket initialization
initSocket(server)

//global error handler
app.use((err,req,res,next) => {
    console.error(err.stack)
    res.status(err.statusCode || 500).json({message : err.message || 'internal server error'})
})

server.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`)
})