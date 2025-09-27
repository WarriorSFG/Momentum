import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Base from "./base.jsx";
import QuestionSelect from "../components/questionSelect.jsx"; // 1. Import the component

const TestQ = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject, chapters } = location.state || {};

  // All the existing state for managing the test
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [time, setTime] = useState(0); // Timer state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");
  const hasStarted = useRef(false);

  // Fetching logic (no changes needed here)

  useEffect(() => {
    if (!subject || !chapters) {
      setError("No subject or chapters selected.");
      setLoading(false);
      return;
    }

    const startTest = async () => {
      // 4. Set the flag to true immediately
      hasStarted.current = true;
      try {
        const res = await fetch("http://localhost:4000/teststart", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ subject, chapters }),
        });
        const data = await res.json();
        if (res.ok) { setTestData(data); } else { setError(data.error || "Failed to start test."); }
      } catch (err) { setError(err + "An error occurred."); } finally { setLoading(false); }
    };

    // 3. Check the flag. If it's true, don't run again.
    // This stops the Strict Mode double-run
    if (hasStarted.current) {
      return;
    }

    startTest();
    
  }, [subject, chapters, token]); // Dependencies remain the same


  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectAnswer = (choiceIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = choiceIndex;
    setAnswers(newAnswers);
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = async () => {
    // This is your lock for the submit button. Keep it.
    if (isSubmitting) {
      return; 
    }
    setIsSubmitting(true);
    try {
      await fetch("http://localhost:4000/testsubmit", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ testID: testData.testID, answers }),
      });
      alert("Test submitted successfully!");
      navigate('/dashboard');
    } catch (err) {
      alert(err + "Failed to submit test.");
    }
  };
  
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  if (loading) return <Base><p className="mt-20">Loading test...</p></Base>;
  if (error) return <Base><p className="mt-20 text-red-400">{error}</p></Base>;
  if (!testData) return <Base><p className="mt-20">Could not load test data.</p></Base>;

  const currentQuestion = testData.questions[currentQuestionIndex];

  return (
    <Base>
      <h2 className="text-4xl font-bold mt-20">TEST IN PROGRESS</h2>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl p-4">
        {/* Left Side: Question */}
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
                    (answers[currentQuestionIndex] === i ? "bg-[#8AE08A] text-black " : "bg-[#1B0033] ") +
                    "rounded-xl px-6 py-3 text-left hover:bg-[#32104E] transition"
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Timer and Question Selector */}
        <div className="flex flex-col gap-6 lg:w-1/3">
          {/* Timer */}
          <div className="w-full bg-[#2A0A44] rounded-2xl p-4 flex justify-center items-center shadow-md">
            <span className="text-2xl font-semibold">{formatTime(time)}</span>
          </div>

          {/* Question Selector Grid */}
          <QuestionSelect
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={handleQuestionSelect}
            onSubmit={handleSubmitTest}
          />
        </div>
      </div>
    </Base>
  );
};

export default TestQ;