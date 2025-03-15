import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getChefScores } from '../lib/api';

const ChefScoresPage = () => {
  const [chefData, setChefData] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('totalPoints');
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { chefs, episodes } = await getChefScores();
      setChefData(chefs);
      setEpisodes(episodes);
      setLoading(false);
    }
    
    fetchData();
  }, []);
  
  // Sort chefs based on selected criteria
  const sortedChefs = [...chefData].sort((a, b) => {
    if (sortBy === 'totalPoints') {
      return b.totalPoints - a.totalPoints;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy.startsWith('episode-')) {
      const episodeIndex = parseInt(sortBy.split('-')[1]) - 1;
      return b.scores[episodeIndex] - a.scores[episodeIndex];
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading chef scores...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Standings</Link>
          <h1 className="text-3xl font-bold text-center">Chef Performance By Episode</h1>
          <div className="w-20"></div> {/* Empty div for balance */}
        </div>
        
        {/* Rest of your component remains similar, but using the new data structure */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-3 text-left">
                    <button 
                      onClick={() => setSortBy('name')} 
                      className={`font-medium ${sortBy === 'name' ? 'text-blue-600' : ''}`}
                    >
                      Chef Name
                    </button>
                  </th>
                  {episodes.map((episode, i) => (
                    <th key={episode.id} className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setSortBy(`episode-${i+1}`)} 
                        className={`font-medium ${sortBy === `episode-${i+1}` ? 'text-blue-600' : ''}`}
                      >
                        Ep {episode.episode_number}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">
                    <button 
                      onClick={() => setSortBy('totalPoints')} 
                      className={`font-medium ${sortBy === 'totalPoints' ? 'text-blue-600' : ''}`}
                    >
                      Total
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedChefs.map((chef) => (
                  <tr key={chef.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{chef.name}</td>
                    {chef.scores.map((score, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <span 
                          className={`inline-block w-8 h-8 rounded-full flex items-center justify-center
                          ${score >= 12 ? 'bg-green-100 text-green-800' : 
                            score <= 6 ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
                        >
                          {score}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-bold">{chef.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Rest of your component (scoring guide, etc.) */}
      </div>
    </div>
  );
};

export default ChefScoresPage;