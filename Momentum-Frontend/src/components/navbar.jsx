import React from 'react'
import Logo from '../assets/logo.svg'
import { Link } from 'react-router-dom';

const navbar = () => {
  return (
    <>
    {/* Navbar */}
          <header className="flex justify-between items-center px-4 sm:px-8 py-4 bg-[#9D61D7]">
            <div className="flex flex-row items-center space-x-2 sm:space-x-3">
              <img src={Logo} alt="Logo" className="w-8 sm:w-10" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
                MOMENTUM
              </h1>
            </div>
            <div className="space-x-2 sm:space-x-4">
              <Link to="/"className="px-3 sm:px-4 py-2 rounded-full bg-white text-purple-700 font-bold hover:bg-gray-100 text-sm sm:text-base">
                <button>
                Logout
                </button>
              </Link>
              
            </div>
          </header>
    </>
  )
}

export default navbar