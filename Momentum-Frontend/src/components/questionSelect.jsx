import React from 'react'

const questionSelect = () => {
  return (
    <>
    {/* Question Selector */}
          <div className="w-full bg-[#2A0A44] rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">QUESTION SELECT</h3>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                <button
                  key={num}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    num === 1 || num === 2 || num === 6 || num === 9
                      ? "bg-[#8AE08A] text-black"
                      : num === 3
                      ? "bg-gray-600 text-white"
                      : "bg-black text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button className="w-full bg-[#8AE08A] text-black font-bold py-2 rounded-xl hover:bg-green-400">
              SUBMIT
            </button>
          </div>
      
    </>
  )
}

export default questionSelect