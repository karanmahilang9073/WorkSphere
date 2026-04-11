import React, {useEffect, useState, useRef} from 'react'
import { chat } from '../../services/AiService'
import { toast } from 'react-toastify'



function ChatBox() {
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const messageEndRef = useRef(null)

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({behavior : 'smooth'})
    }, [messages])

    const handleSend = async() => {
        const message = currentMessage.trim()
        if(!message) return;
        const userMessage = {role : "user", text : message}
        setMessages((prev) => [...prev, userMessage])
        setCurrentMessage('')
        setLoading(true)
        setError(null)
        try {
            const res = await chat(message)
            const aiReply = res?.reply || 'something went wrong, please try again later'
            const aiMessage = {role : "ai", text : aiReply}
            setMessages((prev) => [...prev, aiMessage])
        } catch (error) {
            console.error('error while chat', error)
            setError('failed to chat with AI')
            toast.error('failed to chat with AI')
        } finally {
            setLoading(false)
        }
    }


  return (
    <div className='flex flex-col h-125 border rounded-lg p-4'>

        {/* error */}
        {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
        )}


      {/* message container */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, index) => (
            <div key={msg.text + index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    {msg.text}
                </div>
            </div>
        ))}

        {/* loading indicator */}
        {loading && (
            <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg bg-gray-200 text-black">
                    Typing...
                </div>
            </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* input and button */}
        <div className="flex gap-2 mt-4">
            <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder='Type a message...' className='flex-1 border rounded-lg px-3 py-2 outline-none' />

            <button onClick={handleSend} disabled={loading || !currentMessage.trim()} className='bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50'>
                send
            </button>
        </div>
    </div>
    
  )
}

export default ChatBox
