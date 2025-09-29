import React, { useEffect, useState } from "react";
import Base from "./base.jsx";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { BACKENDURL } from "../components/Backend.js";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKENDURL}stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setStats(data);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <Base>
        <p className="text-white text-center mt-10">Loading...</p>
      </Base>
    );
  }

  if (!stats) {
    return (
      <Base>
        <p className="text-red-400 text-center mt-10">
          Failed to load stats. Please login again.
        </p>
      </Base>
    );
  }

  // Pie chart data
  const data = [
    { name: "Learning", value: stats.skills.learning, color: "#60A5FA" },
    { name: "Grasping", value: stats.skills.grasping, color: "#C4A7F7" },
    { name: "Retention", value: stats.skills.retention, color: "#8AE08A" },
    { name: "Application", value: stats.skills.application, color: "#FFD966" },
  ];

  return (
    <Base>
      <div className="flex flex-col lg:flex-row items-start justify-between w-full max-w-6xl mx-auto pl-0 pr-16 py-6 gap-16">
        {/* Left Section */}
        <div className="flex justify-center items-center">
          <div className="flex flex-col items-start flex-1">
            <h2 className="text-5xl md:text-6xl font-bold mb-2 text-left">
              Welcome!
            </h2>
            <p className="text-3xl font-poppins-100 text-gray-300 mb-10 text-left">
              {/* You can fetch username from JWT if decoded */}
              {username}
            </p>

            {/* Practice / Test cards */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <div className="bg-[#2a0a44] rounded-2xl p-6 w-56 text-center shadow-md">
                <h3 className="font-bold text-xl mb-2">PRACTICE</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Practice specific questions and learn concepts from different
                  chapters and subjects.
                </p>
                <Link to="/practiceS">
                  <button className="px-6 py-2 bg-[#FFD966] text-[#2a0a44] font-bold rounded-full hover:bg-yellow-500">
                    GO!
                  </button></Link>
              </div>

              <div className="bg-[#2a0a44] rounded-2xl p-6 w-56 text-center shadow-md">
                <h3 className="font-bold text-xl mb-2">TEST</h3>
                <p className="text-sm text-gray-300 mb-4">
                  A quick 20 minutes rush round to test your knowledge
                </p>
                <br />
                <Link to="/test">
                  <button className="px-6 py-2 bg-[#8AE08A] text-[#221149] font-bold rounded-full hover:bg-green-500">
                    START!
                  </button>
                </Link>
              </div>
            </div>

            {/* Practice / Test cards */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <div className="bg-[#2a0a44] rounded-2xl p-6 w-56 text-center shadow-md">
                <h3 className="font-bold text-xl mb-2">GENERATED QUESTIONS</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Practice infinitely with our AI Question generator model.
                </p>
                <Link to="/generatedS">
                  <button className="px-6 py-2 bg-[#AE75D8] text-[#2a0a44] font-bold rounded-full hover:bg-yellow-500 transition-all duration-300 shadow-[0_0_15px_5px_#AE75D8] shadow-[#AE75D8]/50 hover:shadow-xl hover:shadow-yellow-500/50 animate-pulse hover:animate-none">
                    GENERATE!
                  </button>
                </Link>
              </div>

              <div className="bg-[#2a0a44] rounded-2xl p-6 w-56 text-center shadow-md">
                <h3 className="font-bold text-xl mb-2">um</h3>
                <p className="text-sm text-gray-300 mb-4">
                  What should go here
                </p>
                <br />
                <Link to="/test">
                  <button className="px-6 py-2 bg-[#8AE08A] text-[#221149] font-bold rounded-full hover:bg-green-500">
                    IDK
                  </button>
                </Link>
              </div>
            </div>

            {/* History (button links to /testhistory page maybe) */}
            <div className="w-full">
              <h3 className="text-4xl font-bold mb-2 text-left">History</h3>
              <h4 className="text-2xl font-semibold mb-4 text-left">
                PREVIOUS TEST REPORTS
              </h4>

              <div className="bg-[#2a0a44] rounded-2xl p-6 flex flex-row items-center justify-between max-w-lg">
                <p className="text-lg text-gray-300 w-3/4">
                  See your previous tests and rectify mistakes and revisit hard
                  questions
                </p>
                <Link
                  to="/testhistory"
                  className="px-6 py-2 bg-white text-purple-700 text-lg rounded-full font-semibold hover:bg-gray-200 text-center"
                >
                  Check
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (Stats) */}
        <div className="bg-[#2a0a44] rounded-2xl p-8 flex flex-col items-center flex-1 mt-2">
          <h3 className="text-3xl font-bold mb-6">STATS</h3>

          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Stats numbers */}
            <div className="flex flex-col gap-5">
              <div className="text-left bg-[#00000036] rounded-3xl p-4 mb-2 w-48">
                <p className="text-[#FFD966] text-2xl font-bold">
                  {stats.questions.total}
                </p>
                <p className="text-gray-300">Questions Solved</p>
              </div>
              <div className="text-left bg-[#00000036] rounded-3xl p-4 mb-2 w-48">
                <p className="text-[#8AE08A] text-2xl font-bold">
                  {stats.questions.correct}
                </p>
                <p className="text-gray-300">Correct Answers</p>
              </div>
              <div className="text-left bg-[#00000036] rounded-3xl p-4 mb-2 w-48">
                <p className="text-[#FF6666] text-2xl font-bold">
                  {stats.questions.incorrect}
                </p>
                <p className="text-gray-300">Incorrect Answers</p>
              </div>
              <div className="text-left bg-[#00000036] rounded-3xl p-4 mb-2 w-48">
                <p className="text-white text-2xl font-bold">
                  {stats.teststaken}
                </p>
                <p className="text-gray-300">Tests Taken</p>
              </div>
            </div>

            {/* Pie Chart */}
            <PieChart width={400} height={400}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={200}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* Legend below the chart */}
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
            <span className="text-[#60A5FA]">
              LEARNING : {stats.skills.learning}
            </span>
            <span className="text-[#C4A7F7]">
              GRASPING : {stats.skills.grasping}
            </span>
            <span className="text-[#8AE08A]">
              RETENTION : {stats.skills.retention}
            </span>
            <span className="text-[#FFD966]">
              APPLICATION : {stats.skills.application}
            </span>
          </div>
            <div className="w-full mt-10">
              <h3 className="text-4xl font-bold mb-2 text-left">LEADERBOARD</h3>
              <h4 className="text-xl font-semibold mb-4 text-left">
                TOP PERFORMERS
              </h4>
              <div className="bg-[#2a0a44] text-left rounded-2xl  flex flex-row items-center justify-between max-w-lg">
                <p className="text-lg text-gray-300 w-3/4">
                  See how you rank among other users, solve the maximum to reach the top!
                </p>
                <Link
                  to="/Leaderboard"
                  className="px-6 py-2 bg-white text-purple-700 text-lg rounded-full font-semibold hover:bg-gray-200 text-center"
                >
                  Check
                </Link>
              </div>
            </div>
        </div>
        
      </div>
    </Base>
  );
};

export default Dashboard;
