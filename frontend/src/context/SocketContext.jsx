import { createContext, useEffect, useState } from 'react'
import {io} from 'socket.io-client'

export const SocketContext = createContext()

export const SocketProvider = ( {children} ) => {
    const [socket, setSocket] = useState(null)

    //connect socket
    const connectSocket = (token) => {
        if(!token) return;
        const newSocket = io("http://localhost:8000", {
            auth : {
                token,
            }
        })

        setSocket(newSocket)
    }
    //disconnect socket
    const disconnectSocket = () => {
        if(socket){
            socket.disconnect()
            setSocket(null)
        }
    }

    //cleanup
    useEffect(() => {
        return () => {
            if(socket) socket.disconnect()
        }
    }, [socket])

    return (
        <SocketContext.Provider 
            value={{
                socket,
                connectSocket,
                disconnectSocket,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
} 