import React, { useState, useEffect } from 'react'
import Question from './question.jsx'
import { Clock } from 'lucide-react'

const QuestionBase = ({ children, heading }) => {
  const [seconds, setSeconds] = useState(0)
  const [minutes, setMinutes] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev === 59) {
          setMinutes(m => m + 1)
          return 0
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <h2 className="text-4xl font-bold mb-6 text-left mt-20">{heading}</h2>
      <div className="flex flex-row gap-24 items-center px-6 py-4 w-4/5">
        <Question />

        <div className="flex justify-center flex-col gap-6 lg:w-100 w-3/5 items-start">
          {/* Timer */}
          <div className="w-full bg-[#2A0A44] rounded-2xl px-6 py-4 flex items-center gap-3 justify-center shadow-md justify">
            <Clock className="w-6 h-6" />
            <span className="text-xl text-center">
              {minutes < 10 ? '0' + minutes : minutes}:
              {seconds < 10 ? '0' + seconds : seconds}
            </span>
          </div>

          {children}
        </div>
      </div>
    </>
  )
}

export default QuestionBase
