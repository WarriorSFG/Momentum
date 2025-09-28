import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Base from "./base.jsx";

const PracticeS = () => {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/practiceselect");
        const data = await res.json();
        setSubjects(data.subjects || []);
        setChapters(data.chapters || []);
        setDifficulties(data.difficulties || []);
      } catch (err) {
        console.error("Error fetching practice options:", err);
      }
    };
    fetchData();
  }, []);

  const handleGo = () => {
    // Update the validation check
    if (!selectedSubject || selectedChapters.length === 0 || !selectedDifficulty) {
      alert("Please select subject, at least one chapter, and difficulty!");
      return;
    }
    navigate("/practiceQ", {
      state: {
        subject: selectedSubject,
        chapters: selectedChapters, // Send the array directly
        difficulty: selectedDifficulty,
      },
    });
  };
  const handleChapterChange = (chapter) => {
    setSelectedChapters(prev =>
      // If chapter is already in the array, remove it. Otherwise, add it.
      prev.includes(chapter)
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };
  return (
    <Base>
      <div className="flex items-center justify-center w-full p-6">
        <div className="bg-[#2A0A44] rounded-2xl shadow-lg p-8 w-3/4 max-w-md text-center">
          <h2 className="text-4xl font-bold mb-6">PRACTICE</h2>

          <div className="flex flex-col gap-4 mb-6">
            {/* Subject */}
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

            {/* Chapter */}
            <div className="w-full bg-[#1B0033] text-white p-4 rounded-xl max-h-40 overflow-y-auto text-left">
              <p className="mb-2 font-semibold">SELECT CHAPTER(S)</p>
              {selectedSubject !== "" &&( chapters.map((c, idx) => (
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
              )))}
            </div>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#1B0033] text-white py-3 px-4 rounded-xl"
            >
              <option value="">SELECT DIFFICULTY</option>
              {selectedChapters.length!=0 && (difficulties.map((d, idx) => (
                <option key={idx} value={d}>{d}</option>
              )))}
            </select>
          </div>

          <Link
            to="/dashboard"
            className="bg-[#FFFFFF] text-black font-bold px-8 py-1 mx-2 rounded-full hover:bg-yellow-400 transition"
          >
            Back
          </Link>

          <button
            onClick={handleGo}
            className="bg-[#FFD84D] text-black font-bold px-8 py-2 rounded-full hover:bg-yellow-400 transition"
          >
            Start!
          </button>
        </div>
      </div>
    </Base>
  );
};

export default PracticeS;
