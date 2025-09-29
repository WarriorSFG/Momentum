import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Base from "./base.jsx";
import { BACKENDURL } from "../components/Backend.js";

// You can name this component 'Test' or 'TestSelection'
const TestSelection = () => { 
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [startingTest, setStartingTest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BACKENDURL}practiceselect`);
        const data = await res.json();
        setSubjects(data.subjects || []);
        setChapters(data.chapters || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchData();
  }, []);

  const handleChapterChange = (chapter) => {
    setSelectedChapters(prev =>
      prev.includes(chapter)
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  const handleStartTest = () => {
    if (!selectedSubject || selectedChapters.length === 0) {
      alert("Please select a subject and at least one chapter!");
      return;
    }
    if (startingTest) return; // Prevent multiple clicks
    setStartingTest(true);
    navigate("/testQ", {
      state: {
        subject: selectedSubject,
        chapters: selectedChapters,
      },
    });
  };

  return (
    <Base>
      <div className="flex items-center justify-center w-full p-6 mt-10">
        <div className="bg-[#2A0A44] rounded-2xl shadow-lg p-8 w-full max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-6">START TEST</h2>
          <div className="flex flex-col gap-6 mb-8">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#1B0033] text-white py-3 px-4 rounded-xl"
            >
              <option value="">SELECT SUBJECT</option>
              {subjects.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
            <div className="w-full bg-[#1B0033] text-white p-4 rounded-xl max-h-48 overflow-y-auto text-left">
              <p className="mb-2 font-semibold">SELECT CHAPTER(S)</p>
              {chapters.map((c, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`chapter-${idx}`}
                    value={c}
                    checked={selectedChapters.includes(c)}
                    onChange={() => handleChapterChange(c)}
                    className="mr-2"
                  />
                  <label htmlFor={`chapter-${idx}`}>{c}</label>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard"
            className="bg-[#FFFFFF] text-black font-bold px-8 py-2 mx-2 rounded-full hover:bg-yellow-400 transition"
          >
            Back
          </Link>

          <button
            onClick={handleStartTest}
            className="bg-[#8AE08A] text-[#221149] font-bold px-8 py-2 rounded-full hover:bg-green-400 transition text-lg"
          >
            START!
          </button>
        </div>
      </div>
    </Base>
  );
};

export default TestSelection;