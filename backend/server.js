import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'


dotenv.config()


const PORT = process.env.PORT || 7000
const app = express()


// basic response on browser
app.get('/', (req, res)=> {
    res.send('backend running successfully')
})


//database call
connectDB()

app.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`)
})