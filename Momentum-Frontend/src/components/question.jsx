import React from 'react'

const question = () => {
  return (
    <>
    
    {/* Left: Question Box */}
        <div className="bg-[#2A0A44] rounded-2xl p-6 flex-1 shadow-lg w-4/5">
          
          <p className="text-lg mb-6 text-left">
            Q.3 The ratio 5 : 4 expressed as a percent equals:
          </p>

          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className="bg-[#1B0033] rounded-xl px-6 py-3 text-left hover:bg-[#32104E] transition"
              >
                12.5%
              </button>
            ))}
          </div>
        </div>
    </>
  )
}

export default question