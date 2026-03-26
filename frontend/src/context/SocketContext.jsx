import { createContext, useContext, useEffect, useState } from 'react'
import {io} from 'socket.io-client'

export const SocketContext = createContext()

export const SocketProvider = ( {children} ) => {
    const [socket, setSocket] = useState(null)

    //connect socket
    const connectSocket = (token) => {
        if(!token) return;
        try {
            const newSocket = io("http://localhost:8000", {
                auth : {token}
            })
            newSocket.on('connect', () => console.log('socket connected'))
            newSocket.on('error', (error) => console.error('socket error', error))
    
            setSocket(newSocket)
        } catch (error) {
            console.error('failed to connect socket:', error)
        }
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

export const useSocket = () => {
    const context = useContext(SocketContext)
    if(!context) {
        throw new Error('useSocket must be used within socketProvider')
    }
    return context
}