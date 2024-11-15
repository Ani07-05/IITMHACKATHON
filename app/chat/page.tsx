'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'

export default function Component() {
  const [messages, setMessages] = useState<{ text: string; sender: string; id: number }[]>([
    { text: "Hi! How can I help you today?", sender: 'ai', id: 0 }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (input.trim() === '') return

    const newMessage = { text: input, sender: 'user', id: Date.now() }
    setMessages([...messages, newMessage])
    setInput('')
    setIsThinking(true)

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      setIsThinking(false)
      const aiMessage = { text: data.response, sender: 'ai', id: Date.now() }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch aborted')
      } else {
        console.error('Error sending message:', error)
        setMessages(prev => [...prev, { text: 'Error: Could not reach the server.', sender: 'ai', id: Date.now() }])
      }
      setIsThinking(false)
    } finally {
      abortControllerRef.current = null
    }
  }

  const stopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsThinking(false)
      setMessages(prev => [...prev, { text: 'Response stopped by user.', sender: 'ai', id: Date.now() }])
    }
  }

  const ThinkingAnimation = () => (
    <div className="flex space-x-2 p-4">
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.1 }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
      />
    </div>
  )

  const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [isComplete, setIsComplete] = useState(false)
    const hasAnimated = useRef(false)
    
    useEffect(() => {
      if (isComplete || hasAnimated.current) {
        setDisplayedText(text)
        return
      }
      
      hasAnimated.current = true
      let currentIndex = 0
      const timer = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsComplete(true)
          clearInterval(timer)
        }
      }, 20)
      
      return () => clearInterval(timer)
    }, [text, isComplete])

    return <span>{displayedText}</span>
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
              >
                <div
                  className={`
                    max-w-[85%] px-4 py-2 
                    ${message.sender === 'user' 
                      ? 'bg-blue-600 rounded-2xl' 
                      : 'bg-transparent'
                    }
                  `}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.sender === 'ai' ? (
                      <TypewriterText text={message.text} />
                    ) : (
                      message.text
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ThinkingAnimation />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white border-gray-700 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <Button onClick={sendMessage} className="bg-white text-black hover:bg-gray-200">
              Send
            </Button>
            {isThinking && (
              <Button onClick={stopResponse} className="bg-red-600 text-white hover:bg-red-700" aria-label="Stop response">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}