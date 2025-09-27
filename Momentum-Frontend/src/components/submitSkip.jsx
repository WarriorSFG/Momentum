import React from 'react'

const SubmitSkip = ({ button1, button2, onSubmit, onSkip }) => {
  return (
    <div className="w-full bg-[#2A0A44] p-6 rounded-3xl shadow-lg flex flex-col gap-4 items-center w-64 h-64 mx-auto justify-center">
      {/* Submit Button */}
      <button
        onClick={onSubmit}
        className="w-3/5 px-6 py-2 bg-[#8AE08A] text-[#221149] font-bold rounded-full hover:bg-green-400 transition duration-200 font-lg"
      >
        {button1}
      </button>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="w-3/5 px-6 py-2 bg-white text-[#221149] font-bold rounded-full hover:bg-gray-200 transition duration-200"
      >
        {button2}
      </button>
    </div>
  )
}

export default SubmitSkip
