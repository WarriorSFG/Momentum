import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#3D096D] to-[#9145D8] text-white p-4 text-center overflow-hidden relative"
    >
      {/* Background elements - stars, planets (now purple-themed) */}
      <div className="absolute inset-0 z-0">
        {/* Stars/Lights */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-purple-200 rounded-full animate-pulse-slow delay-200"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse-slow delay-400"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-500 rounded-full animate-pulse-slow delay-600"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse-slow delay-800"></div>

        {/* Floating Numbers (like space debris, now matching theme) */}
        <span className="absolute text-8xl md:text-9xl font-extrabold text-white opacity-10 top-[10%] left-[5%] transform rotate-12 animate-float">4</span>
        <span className="absolute text-9xl md:text-[10rem] font-extrabold text-white opacity-10 bottom-[20%] left-[30%] transform -rotate-6 animate-float-rev delay-200">0</span>
        <span className="absolute text-8xl md:text-9xl font-extrabold text-white opacity-10 top-[30%] right-[10%] transform rotate-12 animate-float delay-400">4</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-9xl font-extrabold text-[#9D61D7] mb-4 animate-bounce-in">
          404
        </h1>
        <p className="text-3xl md:text-5xl font-bold mb-4 text-white text-shadow-lg animate-fade-in-up">
          Lost in the Learning Galaxy?
        </p>
        <p className="text-lg md:text-xl text-gray-200 mb-8 animate-fade-in-up delay-200">
          It looks like this page took a detour to a dimension unknown. Let's get you back on track!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-8 py-3 bg-[#9D61D7] hover:bg-[#9145D8] text-white rounded-full text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in-up delay-400"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Return to MOMENTUM Hub
        </Link>
      </div>

      {/* Visual Element: Lost Astronaut (now with purple accents) */}
      <div className="absolute bottom-8 right-8 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 z-20 animate-float-astronaut">
        <div className="absolute w-full h-full rounded-full bg-gray-500"></div> {/* Helmet */}
        <div className="absolute bottom-0 w-2/3 h-2/3 left-1/2 -translate-x-1/2 bg-[#9D61D7] rounded-b-full"></div> {/* Body with theme color */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-purple-300 opacity-70"></div> {/* Visor reflection */}
        <span className="absolute text-4xl -top-4 -left-4 text-white opacity-80 pointer-events-none">?</span> {/* Question mark thought bubble */}
      </div>

      {/* Custom Tailwind Animations (unchanged, as they are generic) */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
          100% { transform: translateY(0px) rotate(12deg); }
        }
        @keyframes floatRev {
            0% { transform: translateY(0px) rotate(-6deg); }
            50% { transform: translateY(-12px) rotate(-8deg); }
            100% { transform: translateY(0px) rotate(-6deg); }
        }
        @keyframes floatAstronaut {
            0% { transform: translateY(0px) rotate(-5deg); }
            50% { transform: translateY(-8px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(-5deg); }
        }
        @keyframes pulseSlow {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 0.2; }
        }

        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-bounce-in { animation: bounceIn 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-rev { animation: floatRev 7s ease-in-out infinite; }
        .animate-float-astronaut { animation: floatAstronaut 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }

        /* Inline text-shadow for readability without config */
        .text-shadow-lg {
            text-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  );
}