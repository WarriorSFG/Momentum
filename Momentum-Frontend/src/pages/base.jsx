import React from 'react'
import photo from '../assets/background.jpg'
import Navbar from '../components/navbar.jsx'

const Base = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-700 to-purple-900 text-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main
        className="relative flex-grow flex flex-col  items-center  overflow-hidden bg-cover bg-center px-0 py-5"
        style={{ backgroundImage: `url(${photo})` }}
      >
        {/* Overlay (behind content) */}
        <div className="absolute inset-0 bg-black/80 z-0"></div>

        {/* Content (on top of overlay) */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Base


