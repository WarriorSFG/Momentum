import React from 'react';

const Question = ({ questionData, selectedChoice, onSelectChoice }) => {
  return (
    <div className="bg-[#2A0A44] rounded-2xl p-6 flex-1 shadow-lg w-4/5">
      <p className="text-lg mb-6 text-left">{questionData.question}</p>
      <div className="flex flex-col gap-4">
        {questionData.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelectChoice(i)}
            className={
              (selectedChoice === i ? "bg-[#8AE08A] text-black " : "bg-[#1B0033] ") +
              "rounded-xl px-6 py-3 text-left " +
              (selectedChoice === i ? "" : "hover:bg-[#32104E] transition")
            }
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Question;