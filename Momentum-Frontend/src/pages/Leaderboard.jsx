import React, { useState, useEffect } from "react";
import Base from "./base.jsx";
import { Link } from "react-router-dom";
import { BACKENDURL } from "../components/Backend.js";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${BACKENDURL}leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setLeaderboard(data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [token]);

  if (loading) return <Base><p className="mt-20">Loading Leaderboard...</p></Base>;

  return (
    <Base>
      <div className="w-full max-w-2xl mx-auto py-6">
        <h2 className="text-5xl font-bold mb-8 text-center text-yellow-300">🏆 Leaderboard 🏆</h2>
        <div className="bg-[#2A0A44]/80 rounded-2xl p-6 shadow-lg">
          <ol className="space-y-4">
            {leaderboard.map((user, index) => (
              <li key={index} className="flex items-center justify-between p-4 bg-[#1B0033] rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl font-bold w-12">{index + 1}.</span>
                  <span className="text-xl font-semibold">{user.username}</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{user.score}Q Solved</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
                <Link to="/dashboard">
                  <button className="px-6 py-2 bg-[#AE75D8] text-[#2a0a44] font-bold rounded-full hover:bg-yellow-500 transition-all duration-300 ">
                    Back
                  </button>
                </Link>
    </Base>
  );
};

export default Leaderboard;