import React from 'react';

const QuestionSelect = ({
  answers, // The array of user's answers (e.g., [0, null, 3, ...])
  currentQuestionIndex, // The index of the current question (0-9)
  onQuestionSelect, // Function to call when a number is clicked
  onSubmit, // Function to call when the final submit button is clicked
}) => {
  const getButtonClass = (index) => {
    if (index === currentQuestionIndex) {
      return "bg-[#FFD966] text-black ring-2 ring-white"; // Current question
    }
    if (answers[index] !== null) {
      return "bg-[#8AE08A] text-black"; // Answered question
    }
    return "bg-black text-white"; // Unanswered question
  };

  return (
    <div className="w-full bg-[#2A0A44] rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">QUESTION SELECT</h3>
      <div className="grid grid-cols-5 gap-3 mb-6">
        {answers.map((_, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(index)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-transform transform hover:scale-110 ${getButtonClass(index)}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <button 
        onClick={onSubmit} 
        className="w-full bg-[#8AE08A] text-black font-bold py-2 rounded-xl hover:bg-green-400"
      >
        SUBMIT TEST
      </button>
    </div>
  );
};

export default QuestionSelect;