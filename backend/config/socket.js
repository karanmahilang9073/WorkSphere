import {Server} from 'socket.io'
import JWT from 'jsonwebtoken'

export const initSocket = (server) => {
    const io = new Server(server,{
        cors : {
            origin : "http://localhost:5173",
            methods : ["GET", "POST"]
        }
    })

    //authntication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token
            if(!token){
                return next(new Error('authentication error: token missing'))
            }
            const decoded = JWT.verify(token, process.env.JWT_SECRET)
            socket.user = decoded  //attach user info
            next()
        } catch (error) {
            next(new Error('authentication error: invalid token'))
        }
    })

    
    //connection
    io.on("connection", (socket) => {
        console.log("user connected:", socket.user?.id)
        //join personal room
        socket.join(socket.user?.id)

        socket.on("send-notification", (data) => {
            io.to(data.recipientId).emit("receive-notification", data)
        })

        socket.on("disconnect", () => {
            console.log("user disconnected", socket.user?.id)
        })
    })
    return io
}