import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Base from "./base.jsx";
import QuestionSelect from "../components/questionSelect.jsx";
import { BACKENDURL } from "../components/Backend.js";

const TestQ = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject, chapters } = location.state || {};
  const hasStarted = useRef(false);

  // --- STATE MANAGEMENT ---
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill({ answer: null, timeTaken: 0 }));
  
  const [timeLeft, setTimeLeft] = useState(1200); // Main 20-min countdown
  const [lastSwitchTime, setLastSwitchTime] = useState(1200); // Tracks time of last navigation

  const token = localStorage.getItem("token");

  // --- HANDLER FUNCTIONS ---

  const handleSelectAnswer = (choiceIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      answer: choiceIndex,
    };
    setAnswers(newAnswers);
  };

  const handleQuestionSelect = (newIndex) => {
    // Prevent switching to the same question
    if (newIndex === currentQuestionIndex) return;

    // Calculate time spent on the question we are leaving
    const timeSpent = lastSwitchTime - timeLeft;

    // Update the 'answers' array with the new cumulative time
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      timeTaken: (newAnswers[currentQuestionIndex]?.timeTaken || 0) + timeSpent,
    };
    setAnswers(newAnswers);

    // Update the last switch time to now
    setLastSwitchTime(timeLeft);
    // Navigate to the new question
    setCurrentQuestionIndex(newIndex);
  };

  const handleSubmitTest = useCallback(async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Calculate and add the time spent on the final question before submitting
    const finalTimeSpent = lastSwitchTime - timeLeft;
    const finalAnswers = [...answers];
    finalAnswers[currentQuestionIndex] = {
        ...finalAnswers[currentQuestionIndex],
        timeTaken: (finalAnswers[currentQuestionIndex]?.timeTaken || 0) + finalTimeSpent,
    };

    if (!isAutoSubmit) {
      const unansweredCount = finalAnswers.filter(a => a.answer === null).length;
      if (unansweredCount > 0) {
        if (!window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      await fetch(`${BACKENDURL}testsubmit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ testID: testData.testID, answers: finalAnswers }),
      });
      if (!isAutoSubmit) { alert("Test submitted successfully!"); }
      navigate('/dashboard');
    } catch (err) {
      alert(err + "Failed to submit test.");
      setIsSubmitting(false);
    }
  }, [isSubmitting, answers, testData, navigate, token, timeLeft, lastSwitchTime, currentQuestionIndex]);

  // --- EFFECT HOOKS ---

  // Effect to start the test ONCE
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (!subject || !chapters) {
      setError("No subject or chapters selected.");
      setLoading(false);
      return;
    }
    
    const startTest = async () => {
      try {
        const res = await fetch(`${BACKENDURL}teststart`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ subject, chapters }),
        });
        const data = await res.json();
        if (res.ok) { setTestData(data); } else { setError(data.error || "Failed to start test."); }
      } catch (err) { setError(err + "An error occurred."); } finally { setLoading(false); }
    };
    startTest();
  }, [subject, chapters, token]);

  // Main countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if(testData && !isSubmitting) { // Ensure test has loaded and not already submitting
        alert("Time's up! Submitting your test.");
        handleSubmitTest(true);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmitTest, testData, isSubmitting]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // --- RENDER LOGIC ---

  if (loading) return <Base><p className="mt-20">Loading test...</p></Base>;
  if (error) return <Base><p className="mt-20 text-red-400">{error}</p></Base>;
  if (!testData) return <Base><p className="mt-20">Could not load test data.</p></Base>;

  const currentQuestion = testData.questions[currentQuestionIndex];

  return (
    <Base>
      <h2 className="text-4xl font-bold mt-20">TEST IN PROGRESS</h2>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl p-4">
        <div className="flex-1 lg:w-2/3">
          <p className="text-gray-300 mb-2">QUESTION {currentQuestionIndex + 1} OF 10</p>
          <div className="bg-[#2A0A44] rounded-2xl p-8 w-full">
            <p className="text-lg mb-6 text-left">{currentQuestion.question}</p>
            <div className="flex flex-col gap-4">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAnswer(i)}
                  className={
                    (answers[currentQuestionIndex]?.answer === i ? "bg-[#8AE08A] text-black " : "bg-[#1B0033] ") +
                    "rounded-xl px-6 py-3 text-left hover:bg-[#32104E] transition"
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 lg:w-1/3">
          <div className="w-full bg-[#2A0A44] rounded-2xl p-4 flex justify-center items-center shadow-md">
            <span className="text-2xl font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <QuestionSelect
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={handleQuestionSelect}
            onSubmit={handleSubmitTest}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </Base>
  );
};

export default TestQ;