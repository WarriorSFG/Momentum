import React from 'react'
import Base from './base.jsx'

const practiceS = () => {
  return (
    <>
    <Base  >
    <div className="flex items-center justify-center w-full p-6">
      {/* Card */}
      <div className="bg-[#2A0A44] rounded-2xl shadow-lg p-8 w-3/4 max-w-md text-center">
        {/* Heading */}
        <h2 className="text-4xl font-bold mb-6">PRACTICE</h2>
        <br></br>
        <br></br>

        {/* Select Buttons */}
        <div className="flex flex-col gap-4 mb-6">
          <button className="w-full bg-[#1B0033] hover:bg-[#32104E] transition rounded-xl py-3 font-semibold">
            SELECT SUBJECT
          </button>
          <button className="w-full bg-[#1B0033] hover:bg-[#32104E] transition rounded-xl py-3 font-semibold">
            SELECT CHAPTER
          </button>
          <button className="w-full bg-[#1B0033] hover:bg-[#32104E] transition rounded-xl py-3 font-semibold">
            SELECT DIFFICULTY
          </button>
        </div>
        <br></br>
        {/* Go Button */}
        <button className="bg-[#FFD84D] text-black font-bold px-8 py-2 rounded-full hover:bg-yellow-400 transition">
          GO!
        </button>
      </div>
    </div>
    </Base>
    </>
  )
}

export default practiceS
