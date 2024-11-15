'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ResponsiveContainer } from 'recharts'

interface Prediction {
  overallScore: number;
  topicScores: { topic: string; score: number }[];
  projectedGrowth: { week: number; score: number }[];
}

export default function PredictionPage() {
  const [prediction, setPrediction] = useState<Prediction | null>(null)

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/predict?user_id=123') // Replace with actual user ID
        if (!response.ok) {
          throw new Error('Failed to fetch prediction')
        }
        const data = await response.json()
        setPrediction(data.prediction)
      } catch (error) {
        console.error('Error fetching prediction:', error)
      }
    }
    fetchPrediction()
  }, [])

  if (!prediction) {
    return <div className="container mx-auto p-4">Loading prediction...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Performance Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Predicted Score */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Predicted Score</h3>
              <p className="text-4xl font-bold text-center my-4">{prediction.overallScore}%</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: 'Your Score', score: prediction.overallScore }, { name: 'Average', score: 75 }]}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Predicted Scores by Topic */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Predicted Scores by Topic</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prediction.topicScores.map(({ topic, score }) => ({ name: topic, score }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Projected Growth */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Projected Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prediction.projectedGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
