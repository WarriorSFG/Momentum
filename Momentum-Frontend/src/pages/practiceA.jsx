import React from 'react';
import Base from './base.jsx';
import SubmitSkip from '../components/submitSkip.jsx';

const PracticeA = ({ questionData, userAnswer, result, onNext, onHome }) => {
  const getButtonClass = (optionIndex) => {
    const isCorrectAnswer = optionIndex === result.correctAnswer;
    const isUserAnswer = optionIndex === userAnswer;

    if (isCorrectAnswer) {
      return "bg-green-500"; // Correct answer is always green
    }
    if (isUserAnswer && !result.correct) {
      return "bg-red-500"; // User's incorrect answer is red
    }
    return "bg-[#1B0033]"; // Default
  };

  return (
    <>
      <h2 className="text-4xl font-bold mb-6 text-left mt-20">RESULT</h2>
      <div className="flex flex-row gap-24 items-center px-6 py-4 w-4/5">
        {/* Question Display */}
        <div className="bg-[#2A0A44] rounded-2xl p-6 flex-1 shadow-lg w-4/5">
          <p className="text-lg mb-6 text-left">{questionData.question}</p>
          <div className="flex flex-col gap-4">
            {questionData.options.map((opt, i) => (
              <button
                key={i}
                disabled={true} // Disable buttons in review mode
                className={`${getButtonClass(i)} rounded-xl px-6 py-3 text-left transition`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center flex-col gap-6 lg:w-100 w-3/5 items-start">
            <SubmitSkip button1="Next" button2="Home" onSubmit={onNext} onSkip={onHome} />
        </div>
      </div>
    </>
  );
};

export default PracticeA;