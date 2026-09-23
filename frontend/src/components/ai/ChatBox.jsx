import { useState, useRef, useEffect } from 'react'
import { chat } from '../../services/AiService'
import { toast } from 'react-toastify'
import { Send, Bot, User, Sparkles, Trash2, ArrowRight } from 'lucide-react'

const SUGGESTIONS = [
    "How do I apply for casual leave?",
    "How are overtime hours calculated?",
    "What are the office check-in requirements?",
    "Where can I download my salary slip?"
]

function ChatBox() {
    const [msg, setMsg] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

    const inputRef = useRef(null)
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [messages, loading])

    const handleSend = async (textToSend) => {
        const query = (textToSend || msg).trim()
        if (!query || loading) return

        const newMessages = [...messages, { type: "user", text: query, time: new Date() }]
        setMessages(newMessages)
        setMsg('')
        setLoading(true)

        try {
            const res = await chat(query)
            setMessages([...newMessages, { type: 'ai', text: res.reply, time: new Date() }])
        } catch (error) {
            console.error('Failed to chat with AI', error)
            toast.error('Failed to get a response from Helpdesk AI')
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    const clearChat = () => {
        setMessages([])
        inputRef.current?.focus()
    }

    return (
        <div className='flex flex-col h-full bg-slate-50/40'>
            {/* Top Toolbar */}
            <div className="px-5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    <span className="text-xs font-bold text-slate-800">Support Chat Assistant</span>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={clearChat}
                        className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Clear conversation
                    </button>
                )}
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 min-h-0">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
                        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-2xl flex items-center justify-center shadow-md mb-3.5">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                            How can we help you today?
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 mb-5">
                            Ask anything regarding your leaves, shifts, salary structures, or general workplace policies.
                        </p>

                        <div className="w-full space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                                Popular Topics
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                                {SUGGESTIONS.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(suggestion)}
                                        className="p-2.5 bg-white hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-xl text-xs text-slate-700 hover:text-indigo-700 transition-all text-left flex items-center justify-between group shadow-2xs">
                                        <span className="font-medium line-clamp-1">{suggestion}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((m, i) => {
                        const isUser = m.type === 'user'
                        const timeStr = m.time
                            ? new Date(m.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                            : ''

                        return (
                            <div
                                key={`msg-${i}`}
                                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                {!isUser && (
                                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}

                                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[82%]`}>
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                                            isUser
                                                ? 'bg-indigo-600 text-white rounded-tr-xs'
                                                : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{m.text}</p>
                                    </div>
                                    {timeStr && (
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {timeStr}
                                        </span>
                                    )}
                                </div>

                                {isUser && (
                                    <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}

                {/* Animated Typing Indicator */}
                {loading && (
                    <div className="flex items-start gap-2.5 justify-start">
                        <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-slate-200/90 px-4 py-3 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                            <span className="text-[11px] text-slate-400 font-medium ml-1">AI is thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={endRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-slate-100 shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-2xs">
                    <input
                        type="text"
                        ref={inputRef}
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Type your question or workplace query..."
                        disabled={loading}
                        className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none py-1.5 min-w-0"
                    />

                    <button
                        type="submit"
                        disabled={!msg.trim() || loading}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-2xs">
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChatBox
