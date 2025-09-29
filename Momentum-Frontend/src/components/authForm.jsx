import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BACKENDURL } from "./Backend";

const AuthForm = ({ heading, option, a }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // decide API endpoint
    const endpoint =
      heading.toLowerCase() === "signup" ? "signup" : "login";

    try {
      const res = await fetch(`${BACKENDURL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (endpoint === "signup") {
          setMessage("Account created! Redirecting...");
        } else {
          setMessage("Login successful!");
          // Save token if login
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          if(data.username){
            localStorage.setItem("username", data.username);
          }
        }

        // redirect after short delay
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage(data.error || "Request failed");
      }
    } catch (err) {
      setMessage(err + "Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg bg-[#2a0a44] shadow-xl p-8 sm:p-10 text-white">
      <h2 className="text-6xl sm:text-4xl font-bold text-center mb-6">
        {heading}
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-3/5 border-b-2 border-gray-400 bg-transparent focus:outline-none focus:border-gray-400 py-2 text-base text-center sm:text-base"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-3/5 border-b-2 border-gray-400 bg-transparent focus:outline-none focus:border-gray-400 py-2 text-base text-center sm:text-base"
          />
        </div>

        <button
          type="submit"
          className="w-3/5 py-3 rounded-full bg-white text-[#3D096D] text-xl font-extrabold tracking-wide hover:bg-purple-800 hover:text-white transition duration-300"
        >
          {heading}
        </button>
      </form>

      {message && (
        <p className="text-center text-red-400 mt-4 font-semibold">{message}</p>
      )}

      <p className="text-center text-base mt-6 text-gray-300">
        {a} User?{" "}
        <Link to={`/${option.toLowerCase()}`}>
          <span className="font-semibold text-white hover:underline cursor-pointer">
            {option}
          </span>
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
