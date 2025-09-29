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

  // State Management
  const [timeLeft, setTimeLeft] = useState(1200);
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [questionTime, setQuestionTime] = useState(0); // This is our only timer now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  // --- EFFECT HOOKS ---

  // Effect to start the test ONCE
  useEffect(() => {
    if (hasStarted.current) {
      return; // Gatekeeper to prevent double-run in Strict Mode
    }
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

  // Effect for the per-question timer
  useEffect(() => {
    setQuestionTime(0); // Reset timer for the new question
    const timer = setInterval(() => {
      setQuestionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  // --- HANDLER FUNCTIONS ---

  const handleSelectAnswer = (choiceIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      answer: choiceIndex,
      timeTaken: questionTime,
      globalTime: 1200 - timeLeft,
    };
    setAnswers(newAnswers);
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const unansweredCount = answers.filter(a => a === null).length;

    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await fetch(`${BACKENDURL}testsubmit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ testID: testData.testID, answers }),
      });
      alert("Test submitted successfully!");
      navigate('/dashboard');
    } catch (err) {
      alert(err + "Failed to submit test.");
      setIsSubmitting(false);
    }
  }, [isSubmitting, answers, testData, navigate, token]);
  
useEffect(() => {
  // Exit early if the timer is already at 0
  if (timeLeft <= 0) {
    alert("Time's up! Submitting your test.");
    handleSubmitTest();
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft(prevTime => prevTime - 1);
  }, 1000);

  // Clean up the interval when the component unmounts
  return () => clearInterval(timer);
}, [timeLeft, handleSubmitTest]);

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
                    // FIX #3: Check the 'answer' property of the object
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
            {/* FIX #2: Display the per-question timer */}
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