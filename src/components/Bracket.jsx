import React, { useEffect, useState } from "react";
import { fetchBracketData } from "../services/Bracket";
import LoadingSpinner from "./common/LoadingSpinner";

const Bracket = () => {
  const [bracket, setBracket] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchBracketData();
        setBracket(data);
      } catch (err) {
        console.error("Failed to fetch bracket", err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) {
    return (
      <div className="text-white p-6 flex justify-center items-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-4">Loading bracket...</span>
      </div>
    );
  }

  const rounds = Object.entries(bracket);

  return (
    <div className="bg-black text-white min-h-screen py-10 px-2">
      <h1 className="text-4xl font-bold text-center mb-10">BRACKET</h1>

      <div className="overflow-x-auto">
        <div className="flex justify-start gap-12 min-w-[1200px]">
          {rounds.map(([roundName, roundData], i) => (
            <div key={roundName} className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-1">{roundName}</h2>
              <p className="text-xs text-gray-400 mb-4">
                {new Date(roundData.startDate).toLocaleDateString("en-GB")} -{" "}
                {new Date(roundData.endDate).toLocaleDateString("en-GB")}
              </p>

              {roundData.games.length > 0 ? (
                roundData.games.map((game, idx) => (
                  <div
                    key={game.GameId}
                    className="bg-[#1a1a1a] w-52 h-24 rounded-lg shadow-md mb-6 flex flex-col justify-center items-center border border-gray-600"
                  >
                    <div className="flex justify-between w-full px-3 text-sm font-medium">
                      <span className="truncate">{game.HomeTeamKey}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="truncate">{game.AwayTeamKey}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(game.DateTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-sm">No matches</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bracket;
