import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle, FileText, BarChart2 } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black">
      <h1 className="text-4xl font-bold mb-12 text-white">AI-Powered Learning Assistant</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="bg-black border-white">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <MessageCircle className="mr-2" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white">
              Engage in interactive conversations with our AI to enhance your learning experience.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/chat" passHref>
              <Button className="w-full">Start Chatting</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-black border-white">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <HelpCircle className="mr-2" />
              Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white">
              Test your knowledge with adaptive questions tailored to your learning progress.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/question" passHref>
              <Button className="w-full">Get Questions</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-black border-white">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <FileText className="mr-2" />
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white">
              Receive personalized feedback on your performance and areas for improvement.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/feedback" passHref>
              <Button className="w-full">View Feedback</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-black border-white">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <BarChart2 className="mr-2" />
              Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white">
              Get AI-powered predictions on your future performance based on your learning patterns.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/prediction" passHref>
              <Button className="w-full">See Predictions</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}