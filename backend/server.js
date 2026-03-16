import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import dns from 'dns'
import asyncHandler from './middlewares/asyncHandler.js'

dns.setDefaultResultOrder("ipv4first");

dotenv.config()
const app = express()
app.use(express.json())

const PORT = process.env.PORT || 7000


// basic response on browser
app.get('/', (req, res)=> {
    res.send('backend running successfully')
})


//database call
connectDB()

//global error handler
app.use(asyncHandler)

app.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`)
})