import React from 'react' 
import { Link } from 'react-router-dom';
const signupform = ({heading,option,a}) => { 
    return ( 
    <div className="min-h-screen w-full max-w-lg bg-[#2a0a44] shadow-xl p-8 sm:p-10 text-white"> 
    {/* Title */}
     <br></br> <br></br> 
     <h2 className="text-6xl sm:text-4xl font-bold text-center mb-6">{heading}</h2>
      <br></br> <br></br>
       {/* Form */} 
       <form className="space-y-6"> 
        <div> 
            <input type="text" placeholder="USERNAME" className="w-3/5 border-b-2 border-gray-400 bg-transparent focus:outline-none focus:border-gray-400 py-2 text-base text-center sm:text-base" /> 
            </div>
            <div>
                 <input type="password" placeholder="PASSWORD" className="w-3/5 border-b-2 border-gray-400 bg-transparent focus:outline-none focus:border-gray-400 py-2 text-base text-center sm:text-base" /> 
                 </div>
                  <br></br> <br></br> 
                  {/* Submit Button */} 
                  <Link to="/dashboard">
                  <button type="submit" className="w-3/5 py-3 rounded-full bg-white text-[#3D096D] text-xl font-extrabold tracking-wide hover:bg-purple-800 hover:text-white transition duration-300" > SUBMIT </button> 
                 </Link>
                  </form> {/* Footer */}
                   <p className="text-center text-base mt-6 text-gray-300"> {a} User?{" "} 
                    <Link to={`/${option.toLowerCase()}`}>
  <span className="font-semibold text-white hover:underline cursor-pointer">
    {option}
  </span>
</Link>

                    </p>
                     </div>
    ) 
} 
                    
export default signupform