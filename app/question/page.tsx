'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Message {
  text: string
  sender: 'user' | 'ai'
  id: number
  isQuestion?: boolean
}

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! Would you like to start a quiz? If so, what topic would you like to be questioned on?", sender: 'ai', id: 0 }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { text: input, sender: 'user' as const, id: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setAnswers(prev => [...prev, input])
    setInput('')
    setIsThinking(true)

    try {
      if (!quizStarted) {
        setQuizStarted(true)
        setTopic(input)
        const prompt = `Generate 10 questions about ${input}. Return ONLY the questions, one per line, numbered 1-10.`
        const response = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        })
        
        const data = await response.json()
        const questionList = data.response.split('\n').filter((q: string) => q.trim() !== '').slice(0, 10)
        setQuestions(questionList)
        
        setMessages(prev => [
          ...prev,
          { 
            text: questionList[0], 
            sender: 'ai', 
            id: Date.now(),
            isQuestion: true 
          }
        ])
        setCurrentQuestion(1)
      } else {
        if (currentQuestion < 10) {
          setMessages(prev => [
            ...prev,
            { 
              text: questions[currentQuestion], 
              sender: 'ai', 
              id: Date.now(),
              isQuestion: true 
            }
          ])
          setCurrentQuestion(prev => prev + 1)
        } else {
          // Save quiz data and redirect to prediction
          const quizData = {
            topic,
            questions,
            answers: [...answers, input],
            messages: [...messages, userMessage]
          }
          localStorage.setItem('quizData', JSON.stringify(quizData))
          router.push('/prediction')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        text: 'Sorry, there was an error processing your request.', 
        sender: 'ai', 
        id: Date.now() 
      }])
    } finally {
      setIsThinking(false)
    }
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] px-4 py-2
                    ${message.sender === 'user' 
                      ? 'text-white' 
                      : message.isQuestion 
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-gray-800 text-white border-gray-700 focus:border-blue-500"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isThinking} 
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isThinking ? (
              <motion.div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                />
              </motion.div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}