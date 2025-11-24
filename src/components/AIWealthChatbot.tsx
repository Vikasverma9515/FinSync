'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    options?: string[]
}

export function AIWealthChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 Hi! I'm your AI Wealth Manager. I can help you with investment advice, portfolio analysis, tax planning, and financial goals. How can I assist you today?",
            timestamp: new Date(),
            options: [
                "Analyze my portfolio",
                "Tax saving tips",
                "Investment recommendations",
                "Financial planning"
            ]
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            console.log('Sending message to API:', content)

            const response = await fetch('/api/chat/wealth-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content })
            })

            console.log('API Response status:', response.status)

            if (!response.ok) {
                const errorData = await response.json()
                console.error('API Error:', errorData)
                throw new Error(errorData.error || 'API request failed')
            }

            const data = await response.json()
            console.log('API Response data:', data)

            if (!data.response) {
                console.error('No response in data:', data)
                throw new Error('No response from AI')
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                options: data.followUpOptions
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error: any) {
            console.error('Chat error:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
    }

    const handleOptionClick = (option: string) => {
        sendMessage(option)
    }

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50  p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                        <div className="relative">
                            <Image
                                src="/chatbot.svg"
                                alt="AI Chatbot"
                                width={32}
                                height={32}
                                className="w-15 h-15"
                            />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-teal-400"></div>
                        </div>
                        <div className="absolute -top-12 right-0 bg-navy-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-teal-500/30">
                            AI Wealth Manager
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full h-full md:w-96 md:h-[600px] bg-navy-800/95 backdrop-blur-xl md:rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-400 to-teal-500 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-navy-900 p-2 rounded-full">
                                    <Sparkles className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-navy-900">AI Wealth Manager</h3>
                                    <p className="text-xs text-navy-900/70">Powered by Groq AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-navy-900 hover:bg-navy-900/10 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 ${message.role === 'user'
                                            ? 'bg-teal-400 text-navy-900'
                                            : 'bg-navy-700/50 text-white'
                                            }`}
                                    >
                                        <div className="text-sm">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                    strong: ({ node, ...props }) => <span className="font-bold text-teal-300" {...props} />,
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                        {message.options && message.options.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {message.options.map((option, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleOptionClick(option)}
                                                        className="w-full text-left px-3 py-2 bg-navy-800/50 hover:bg-navy-700 rounded-lg text-sm transition-colors border border-teal-400/30 hover:border-teal-400"
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs opacity-50 mt-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-navy-700/50 rounded-2xl p-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything about wealth management..."
                                    className="flex-1 bg-navy-700/50 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-slate-600/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="bg-teal-400 text-navy-900 p-3 rounded-xl hover:bg-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
