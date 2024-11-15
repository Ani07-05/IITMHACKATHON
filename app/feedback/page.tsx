'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Pie, XAxis, YAxis } from 'recharts'

interface Message {
  text: string
  sender: 'user' | 'ai'
  id: number
}

interface Feedback {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceByTopic: { topic: string; score: number }[];
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const storedMessages = localStorage.getItem('quizMessages')
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }

    const fetchFeedback = async () => {
      try {
        const quizContent = messages.map(m => `${m.sender}: ${m.text}`).join('\n')
        const response = await fetch('http://localhost:5000/generate_feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quiz_content: quizContent })
        })
        if (!response.ok) {
          throw new Error('Failed to fetch feedback')
        }
        const data = await response.json()
        setFeedback(data.feedback)
      } catch (error) {
        console.error('Error fetching feedback:', error)
      }
    }
    fetchFeedback()
  }, [messages])

  if (!feedback) {
    return <div className="container mx-auto p-4 bg-black text-white">Loading feedback...</div>
  }

  return (
    <div className="container mx-auto p-4 bg-black text-white">
      <Card className="w-full max-w-4xl mx-auto bg-gray-900 text-white">
        <CardHeader>
          <CardTitle>Personalized Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Quiz Conversation:</h3>
              <div className="max-h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                    <strong>{message.sender === 'user' ? 'You' : 'AI'}:</strong> {message.text}
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-semibold mb-2 mt-4">Strengths:</h3>
              <ul className="list-disc list-inside mb-4">
                {feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
              <h3 className="text-lg font-semibold mb-2">Areas for Improvement:</h3>
              <ul className="list-disc list-inside mb-4">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
              <h3 className="text-lg font-semibold mb-2">Recommendations:</h3>
              <ul className="list-disc list-inside">
                {feedback.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Performance by Topic</h3>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart
                  data={feedback.performanceByTopic}
                >
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <ChartTooltip content={ChartTooltipContent} />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ChartContainer>
              <h3 className="text-lg font-semibold mb-2 mt-6">Overall Performance</h3>
              <ChartContainer
                config={{
                  value: {
                    label: "Value",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <Pie
                  data={[
                    { name: 'Correct', value: feedback.performanceByTopic.reduce((acc, topic) => acc + topic.score, 0) / feedback.performanceByTopic.length },
                    { name: 'Incorrect', value: 100 - (feedback.performanceByTopic.reduce((acc, topic) => acc + topic.score, 0) / feedback.performanceByTopic.length) },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <ChartTooltip content={ChartTooltipContent} />
                </Pie>
              </ChartContainer>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Button onClick={() => window.location.href = '/prediction'} className="bg-blue-600 text-white hover:bg-blue-700">
              View Prediction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}