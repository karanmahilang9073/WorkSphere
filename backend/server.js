import dotenv from 'dotenv'
import http from 'http'
import dns from 'dns'
import app from './app.js'
import { connectDB } from './config/db.js'
import { initSocket } from './config/socket.js'

dns.setDefaultResultOrder("ipv4first");

dotenv.config()

const server = http.createServer(app)
const PORT = process.env.PORT || 7000

// database call
connectDB()

// socket initialization
export const io = initSocket(server)

server.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`)
})