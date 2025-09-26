import React from "react";
import photo from "../assets/background.jpg";
import Logo from "../assets/logo.svg";
import {Link} from 'react-router-dom'

export default function LandingPage() {
  return (
    <>
      {/* Navbar */}
      <header className="flex justify-between items-center px-4 sm:px-8 py-4 bg-[#9D61D7] relative z-30">
        <div className="flex flex-row items-center space-x-2 sm:space-x-3">
          <img src={Logo} alt="Logo" className="w-8 sm:w-10" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-white">
            MOMENTUM
          </h1>
        </div>
        <div className="space-x-2 sm:space-x-4">
          <Link to="/signup" className="px-3 sm:px-4 py-2 rounded-full bg-white text-purple-700 font-bold hover:bg-gray-100 text-sm sm:text-base">
          <button>
            Sign Up
          </button>
          </Link>
          <Link to="/login" className="px-3 sm:px-4 py-2 rounded-full bg-[#9145D8] text-white font-bold hover:bg-purple-500 text-sm sm:text-base">
            <button>
            Login
          </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main
        className="relative h-[70vh] md:h-[80vh] lg:h-screen flex items-center justify-center text-center overflow-hidden bg-cover bg-center px-4"
        style={{ backgroundImage: `url(${photo})` }}
      >
        {/* Overlay (behind content) */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* Content (on top of overlay) */}
        <div className="relative z-10 w-full max-w-6xl px-4 text-white">
          {/* fluid, clamped heading so it never gets absurdly large */}
          <h2
            className="font-extrabold leading-[0.9] mb-2"
            style={{ fontSize: "clamp(2.5rem, 8vw, 8rem)" }}
          >
            MOMENTUM
          </h2>

          <p className="mt-2 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-[28px] mb-6 tracking-wide">
            INTRODUCING INDIA&apos;S FIRST EVER AI BASED LEARNING PLATFORM
          </p>

          <Link className="px-6 sm:px-8 py-3 bg-white rounded-full text-sm sm:text-lg shadow-lg text-[#3D096D] font-bold hover:bg-purple-800 hover:text-white transition">
           <button>
            JOIN NOW
          </button>
          </Link>
        </div>
      </main>
    </>
  );
}
