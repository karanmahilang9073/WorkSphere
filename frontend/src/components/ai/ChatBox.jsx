import React, { useState, useRef, useEffect} from 'react'
import { chat } from '../../services/AiService'
import { toast } from 'react-toastify'


function ChatBox() {
    const [msg, setMsg] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

    const sendMessage = async() => {
        if(!msg.trim()) return;

        const newMessages = [...messages, {type : "user", text : msg}]
        setMessages(newMessages)
        setLoading(true)

        try {
            const res = await chat(msg)
            setMessages([...newMessages, {type : 'ai', text : res.reply}])
        } catch (error) {
            console.error('failed to chat with ai', error)
            toast.error('failed to chat with AI')
        } finally {
            setMsg('')
            setLoading(false)
        }
    }

    const endRef = useRef()
    useEffect(() => {
        endRef.current?.scrollIntoView({behaviour : 'smooth'})
    })


  return (
    <div className='flex flex-col h-125'>

        {/* ṃessage */}
        <div  className="flex-1 overflow-y-auto border p-2 mb-2 space-y-2">
            {messages.map((m,i) => (
                <div ref={endRef} key={i} className={`p-2 rounded max-w-[80%] ${m.type === 'user' ? 'bg-blue-500 text-white ml-auto' : "bg-gray-200 text-black"}`}>
                    <p className="text-sm font-semibold mb-1">
                        {m.type === 'user' ? 'you' : 'AI'}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                </div>
            ))}

            {/* loading */}
            {loading && (
                <p className="text-gray-500 text-md">AI is typing...</p>
            )}
        </div>

        {/* .input */}
        <div className="flex gap-2">
            <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder='type a message...' className="border p-2 flex-1" />
            <button onClick={sendMessage} className='bg-blue-500 text-white px-3 rounded'>send</button>
        </div>
    </div>
    
  )
}

export default ChatBox
