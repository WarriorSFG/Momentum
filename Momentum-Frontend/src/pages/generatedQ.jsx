import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Base from "./base.jsx";
import Question from "../components/question.jsx";
import SubmitSkip from "../components/submitSkip.jsx";
import PracticeA from "./practiceA.jsx"; // We will use this for the answer view
import { BACKENDURL } from "../components/Backend.js";

const GeneratedQ = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { subject, chapters, difficulty } = location.state || {};

    // State Management
    const [questionData, setQuestionData] = useState(null);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [view, setView] = useState("question"); // 'question' or 'answer'
    const [error, setError] = useState("");
    const [questionKey, setQuestionKey] = useState(0); // To fetch new questions
    const [time, setTime] = useState(0); // Timer in seconds

    const token = localStorage.getItem("token");

    // Fetch a new question whenever the key changes
    useEffect(() => {
        const fetchQuestion = async () => {
            // Reset state for new question
            setQuestionData(null);
            setSelectedChoice(null);
            setError("");
            setTime(0);

            try {
                const res = await fetch(`${BACKENDURL}generatequestion`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ subject, chapters, difficulty }),
                });
                const data = await res.json();
                if (data.message) setError(data.message);
                else setQuestionData(data);
            } catch (err) {
                setError(err + "Failed to load question.");
            }
        };

        fetchQuestion();
    }, [questionKey, subject, chapters, difficulty, token]);

    // Timer logic
    useEffect(() => {
        if (view === "question" && questionData) {
            const timer = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [view, questionData]);

    const handleSubmit = async () => {
        if (selectedChoice === null) {
            alert("Please select an answer first!");
            return;
        }
        const result = {
            correct: questionData.answer === selectedChoice,
            correctAnswer: questionData.answer
        };
        setSubmissionResult(result);
        setView("answer"); // Switch to the answer view
    };

    const handleNext = () => {
        setView("question");
        setQuestionKey(prev => prev + 1); // Trigger fetch for the next question
    };

    const handleSkip = () => {
        setQuestionKey(prev => prev + 1); // Just get the next question
    };

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    };

    if (view === "answer") {
        return (
            <Base>
                <PracticeA
                    questionData={questionData}
                    userAnswer={selectedChoice}
                    result={submissionResult}
                    onNext={handleNext}
                    onHome={() => navigate('/dashboard')}
                />
            </Base>
        );
    }

    // ---- Default View: "question" ----

    if (error) return <Base><p className="text-lg text-red-400 mt-20">{error}</p></Base>;
    if (!questionData) return <Base><p className="text-lg mt-20">Loading...</p></Base>;

    return (
        <Base>
            <h2 className="text-4xl font-bold mb-6 text-left mt-20">PRACTICE</h2>
            <div className="flex flex-row gap-24 items-center px-6 py-4 w-4/5">
                <Question
                    questionData={questionData}
                    selectedChoice={selectedChoice}
                    onSelectChoice={setSelectedChoice}
                />
                <div className="flex justify-center flex-col gap-6 lg:w-100 w-3/5 items-start">
                    <div className="w-full bg-[#2A0A44] rounded-2xl px-6 py-4 flex items-center gap-3 justify-center shadow-md">
                        <span className="text-xl text-center">{formatTime(time)}</span>
                    </div>
                    <SubmitSkip
                        button1="Submit"
                        button2="Skip"
                        onSubmit={handleSubmit}
                        onSkip={handleSkip}
                    />
                </div>
            </div>
        </Base>
    );
};

export default GeneratedQ;