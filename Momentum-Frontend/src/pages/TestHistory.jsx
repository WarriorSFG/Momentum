import React, { useEffect, useState } from "react";
import Base from "./base.jsx";
import { Link } from "react-router-dom";

const TestHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("http://localhost:4000/testhistory", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setHistory(data);
                } else {
                    console.error("Failed to fetch history:", data.error);
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    if (loading) {
        return <Base><p className="text-center mt-10">Loading history...</p></Base>;
    }

    return (
        <Base>
            <div className="w-full max-w-4xl mx-auto py-6">
                <h2 className="text-5xl font-bold mb-8 text-left">Test History</h2>

                {history.length === 0 ? (
                    <p>You haven't taken any tests yet.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {history.map((test) => (
                            <div
                                key={test._id}
                                className="bg-[#2a0a44] rounded-2xl p-6 flex items-center justify-between shadow-lg"
                            >
                                <div>
                                    <p className="text-xl font-semibold">
                                        Test taken on:{" "}
                                        {new Date(test.testdate).toLocaleDateString("en-GB")}
                                    </p>
                                    <p className="text-gray-300">
                                        Score: {test.score} / 10
                                    </p>
                                </div>
                                <Link
                                    to={`/testreview/${test._id}`}
                                    className="px-6 py-2 bg-[#FFD966] text-[#2a0a44] font-bold rounded-full hover:bg-yellow-500"
                                >
                                    Review
                                </Link>
                                <a
                                    href={`http://localhost:4000/testreport/${test._id}?token=${token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600"
                                >
                                    Download Report
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Link to="/dashboard" className="px-3 sm:px-4 py-2 rounded-full bg-white text-purple-700 font-bold hover:bg-gray-100 text-sm sm:text-base">
                <button>
                    Back
                </button>
            </Link>
        </Base>
    );
};

export default TestHistory;