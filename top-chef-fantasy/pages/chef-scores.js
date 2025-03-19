import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import ChefStatus from '../components/ChefStatus';

const ChefScoresPage = () => {
  const [chefData, setChefData] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('status');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        // Fetch episodes (this part is fine as is)
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .order('episode_number', { ascending: true });

        if (episodesError) {
          console.error('Error fetching episodes:', episodesError);
          return;
        }
        setEpisodes(episodesData);  // Set episodes here, before the main query


        // Fetch chefs WITH their scores, joined and filtered
        const { data: chefsData, error: chefsError } = await supabase
          .from('chefs')
          .select(`
            id,
            name,
            status,
            chef_scores!left(
              episode_id,
              score,
              quickfire_winner,
              quickfire_top,
              quickfire_bottom,
              elimination_winner,
              elimination_top,
              elimination_bottom,
              lck_winner
            )
          `)
          .order('name');  // Order by name initially

        if (chefsError) {
          console.error('Error fetching chefs with scores:', chefsError);
          return;
        }

        // Process the joined data
        const processedChefData = chefsData.map(chef => {
          const episodeScores = episodesData.map(episode => {
            // Find the score entry for THIS episode.  Crucially, the join
            // already handles matching chefs and scores.
            const scoreEntry = chef.chef_scores.find(score => score.episode_id === episode.id);

            // Return score data, handling the case where there's NO score entry.
            return {
              score: scoreEntry ? scoreEntry.score : null, // Use null for missing scores
              quickfire_winner: scoreEntry ? scoreEntry.quickfire_winner : false,
              quickfire_top: scoreEntry ? scoreEntry.quickfire_top : false,
              quickfire_bottom: scoreEntry ? scoreEntry.quickfire_bottom : false,
              elimination_winner: scoreEntry ? scoreEntry.elimination_winner : false,
              elimination_top: scoreEntry ? scoreEntry.elimination_top : false,
              elimination_bottom: scoreEntry ? scoreEntry.elimination_bottom : false,
              lck_winner: scoreEntry ? scoreEntry.lck_winner : false,
            };
          });

          // Calculate total points, handling null scores correctly.
          const totalPoints = episodeScores.reduce((sum, entry) => {
            return sum + (entry.score === null ? 0 : entry.score);
          }, 0);

          return {
            id: chef.id,
            name: chef.name,
            status: chef.status,
            scores: episodeScores,
            totalPoints,
          };
        });

        setChefData(processedChefData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
    //Sort logic and return rendering stay the same, with a minor change
    const sortedChefs = [...chefData].sort((a, b) => {
    if (sortBy === 'totalPoints') {
      return b.totalPoints - a.totalPoints;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'status') {
      // First sort by status priority: active, lck, eliminated
      const statusPriority = { 'active': 0, 'lck': 1, 'eliminated': 2 };
      const statusCompare = statusPriority[a.status || 'active'] - statusPriority[b.status || 'active'];
      
      // If status is the same, sort by total points (highest first)
      if (statusCompare === 0) {
        return b.totalPoints - a.totalPoints;
      }
      return statusCompare;
    } else if (sortBy.startsWith('episode-')) {
      const episodeIndex = parseInt(sortBy.split('-')[1]);
      //THIS IS IMPORTANT: if one of the chefs doesn't have a score for that episode, sort them to the bottom
      const scoreA = a.scores[episodeIndex].score === null ? -Infinity : a.scores[episodeIndex].score;
      const scoreB = b.scores[episodeIndex].score === null ? -Infinity : b.scores[episodeIndex].score;
      return scoreB - scoreA;
    }
    return 0;
  });

//in renderScoreCell, check for a null score before assigning a color
const renderScoreCell = (chef, episodeIndex) => {
    const scoreData = chef.scores[episodeIndex];
    //Handle null scores.
    const score = scoreData.score === null ? '-' : scoreData.score; //display '-' for null
    
    // Determine cell background color based on score
    let bgColor = '';
    if (score >= 8) bgColor = 'bg-green-100 text-green-800';
    else if (score >= 3) bgColor = 'bg-green-50 text-green-700';
    else if (score <= -3) bgColor = 'bg-red-100 text-red-800';
    else if (score < 0) bgColor = 'bg-red-50 text-red-700';
    else bgColor = 'bg-gray-100'; // Default for 0 or null

    
    // Create icons for different statuses
    const icons = [];
    if (scoreData.quickfire_winner) icons.push('🔥'); // Quickfire winner
    if (scoreData.elimination_winner) icons.push('🏆'); // Elimination winner
    if (scoreData.lck_winner) icons.push('🔄'); // Last Chance Kitchen winner
    
    return (
      <td key={episodeIndex} className="px-4 py-3 text-center group relative">
      {/* Main score display - remains in the flow */}
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor}`}>
        {score}
      </div>

      {/* Icon container - positioned absolutely */}
      {icons.length > 0 && (
        <div className="absolute top-1 right-1 flex space-x-1">
          {icons.map((icon, index) => (
            <span key={index} className="text-xs">
              {icon}
            </span>
          ))}
        </div>
      )}

      {/* Tooltip (remains unchanged) */}
      {(scoreData.quickfire_winner || scoreData.quickfire_top || scoreData.quickfire_bottom ||
        scoreData.elimination_winner || scoreData.elimination_top || scoreData.elimination_bottom ||
        scoreData.lck_winner) && (
        <div className="absolute z-10 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 left-1/2 transform -translate-x-1/2 mt-1 min-w-max whitespace-nowrap">
          <div className="text-left">
            {scoreData.quickfire_winner && <div>Quickfire Winner (+3)</div>}
            {scoreData.quickfire_top && <div>Quickfire Top (+1)</div>}
            {scoreData.quickfire_bottom && <div>Quickfire Bottom (-1)</div>}
            {scoreData.elimination_winner && <div>Elimination Winner (+5)</div>}
            {scoreData.elimination_top && <div>Elimination Top (+1)</div>}
            {scoreData.elimination_bottom && <div>Elimination Bottom (-1)</div>}
            {scoreData.lck_winner && <div>Last Chance Kitchen Winner (+1)</div>}
          </div>
        </div>
      )}
    </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-blue-500 hover:text-blue-700 transition duration-300">
            ← Back to Standings
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Chef Performance By Episode</h1>
          <div className="w-20"></div> {/* Empty div for balance - consider removing if not needed */}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => setSortBy('name')}
                      className={`flex items-center focus:outline-none ${sortBy === 'name' ? 'text-blue-600' : 'hover:text-blue-500'}`}
                    >
                      Chef Name
                      {sortBy === 'name' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => setSortBy('status')}
                      className={`flex items-center justify-center focus:outline-none ${sortBy === 'status' ? 'text-blue-600' : 'hover:text-blue-500'}`}
                    >
                      Status
                      {sortBy === 'status' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      )}
                    </button>
                  </th>
                  {episodes.map((episode, i) => (
                    <th key={episode.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => setSortBy(`episode-${i}`)}
                        className={`focus:outline-none ${sortBy === `episode-${i}` ? 'text-blue-600' : 'hover:text-blue-500'}`}
                      >
                        Ep {episode.episode_number}
                        {sortBy === `episode-${i}` && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => setSortBy('totalPoints')}
                        className={`flex items-center justify-center focus:outline-none ${sortBy === 'totalPoints' ? 'text-blue-600' : 'hover:text-blue-500'}`}
                    >
                      Total
                      {sortBy === 'totalPoints' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedChefs.map((chef) => (
                  <tr
                    key={chef.id}
                    className={`transition duration-300 ease-in-out hover:bg-gray-50 ${chef.status === 'eliminated' ? 'text-gray-400' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{chef.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <ChefStatus status={chef.status} />
                    </td>
                    {chef.scores.map((_, i) => renderScoreCell(chef, i))}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold">{chef.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Scoring Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-600 mb-2">Chef Status</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <ChefStatus status="active" />
                  <span className="ml-2 text-sm text-gray-500">Active in competition</span>
                </div>
                <div className="flex items-center">
                  <ChefStatus status="lck" />
                  <span className="ml-2 text-sm text-gray-500">In Last Chance Kitchen</span>
                </div>
                <div className="flex items-center">
                  <ChefStatus status="eliminated" />
                  <span className="ml-2 text-sm text-gray-500">Eliminated</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-600 mb-2">Quickfire Challenges</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500">
                <li>Winner: +3 points 🔥</li>
                <li>Top section: +1 point</li>
                <li>Bottom section: -1 point</li>
              </ul>

              <h3 className="font-medium text-gray-600 mb-2 mt-4">Last Chance Kitchen</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500">
                <li>Winner: +1 point 🔄</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-600 mb-2">Elimination Challenges</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500">
                <li>Winner: +5 points 🏆</li>
                <li>Top section: +1 point</li>
                <li>Bottom section: -1 point</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefScoresPage;