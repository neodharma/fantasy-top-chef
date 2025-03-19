import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const ChefScoresPage = () => {
  const [chefData, setChefData] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('totalPoints');
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        // Fetch all episodes
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .order('episode_number', { ascending: true });
        
        if (episodesError) {
          console.error('Error fetching episodes:', episodesError);
          return;
        }
        
        // Fetch all chefs
        const { data: chefsData, error: chefsError } = await supabase
          .from('chefs')
          .select('*')
          .order('name');
        
        if (chefsError) {
          console.error('Error fetching chefs:', chefsError);
          return;
        }
        
        // Fetch all scores
        const { data: scoresData, error: scoresError } = await supabase
          .from('chef_scores')
          .select('*');
        
        if (scoresError) {
          console.error('Error fetching scores:', scoresError);
          return;
        }
        
        // Process chef data with their scores
        const processedChefData = chefsData.map(chef => {
          // Get this chef's scores for each episode
          const episodeScores = episodesData.map(episode => {
            const scoreEntry = scoresData.find(
              score => score.chef_id === chef.id && score.episode_id === episode.id
            );
            
            return {
              score: scoreEntry ? scoreEntry.score : 0,
              quickfire_winner: scoreEntry ? scoreEntry.quickfire_winner : false,
              quickfire_top: scoreEntry ? scoreEntry.quickfire_top : false,
              quickfire_bottom: scoreEntry ? scoreEntry.quickfire_bottom : false,
              elimination_winner: scoreEntry ? scoreEntry.elimination_winner : false,
              elimination_top: scoreEntry ? scoreEntry.elimination_top : false,
              elimination_bottom: scoreEntry ? scoreEntry.elimination_bottom : false
            };
          });
          
          // Calculate total points
          const totalPoints = episodeScores.reduce((sum, entry) => sum + entry.score, 0);
          
          return {
            id: chef.id,
            name: chef.name,
            eliminated: chef.eliminated,
            in_finale: chef.in_finale,
            is_winner: chef.is_winner,
            scores: episodeScores,
            totalPoints
          };
        });
        
        setEpisodes(episodesData);
        setChefData(processedChefData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
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
      const episodeIndex = parseInt(sortBy.split('-')[1]);
      return b.scores[episodeIndex].score - a.scores[episodeIndex].score;
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

  // Function to render score cell with icons for performance
  const renderScoreCell = (chef, episodeIndex) => {
    const scoreData = chef.scores[episodeIndex];
    const score = scoreData.score;
    
    // Determine cell background color based on score
    let bgColor = '';
    if (score >= 8) bgColor = 'bg-green-100 text-green-800';
    else if (score >= 3) bgColor = 'bg-green-50 text-green-700';
    else if (score <= -3) bgColor = 'bg-red-100 text-red-800';
    else if (score < 0) bgColor = 'bg-red-50 text-red-700';
    else bgColor = 'bg-gray-100';
    
    // Create icons for different statuses
    const icons = [];
    if (scoreData.quickfire_winner) icons.push('🔥'); // Quickfire winner
    if (scoreData.elimination_winner) icons.push('🏆'); // Elimination winner
    
    return (
      <td key={episodeIndex} className="px-4 py-3 text-center group relative">
        <div className="flex flex-col items-center">
          <span className={`inline-block w-8 h-8 rounded-full flex items-center justify-center ${bgColor}`}>
            {score}
          </span>
          {icons.length > 0 && (
            <span className="text-xs mt-1">{icons.join(' ')}</span>
          )}
        </div>
        
        {/* Tooltip with details */}
        {(scoreData.quickfire_winner || scoreData.quickfire_top || scoreData.quickfire_bottom || 
          scoreData.elimination_winner || scoreData.elimination_top || scoreData.elimination_bottom) && (
          <div className="absolute z-10 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 left-1/2 transform -translate-x-1/2 mt-1 min-w-max whitespace-nowrap">
            <div className="text-left">
              {scoreData.quickfire_winner && <div>Quickfire Winner (+3)</div>}
              {scoreData.quickfire_top && <div>Quickfire Top (+1)</div>}
              {scoreData.quickfire_bottom && <div>Quickfire Bottom (-1)</div>}
              {scoreData.elimination_winner && <div>Elimination Winner (+5)</div>}
              {scoreData.elimination_top && <div>Elimination Top (+1)</div>}
              {scoreData.elimination_bottom && <div>Elimination Bottom (-1)</div>}
              {chef.in_finale && episodes[episodeIndex].is_finale && <div>In Finale (+5)</div>}
              {chef.is_winner && episodes[episodeIndex].is_finale && <div>Season Winner (+10)</div>}
            </div>
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Standings</Link>
          <h1 className="text-3xl font-bold text-center">Chef Performance By Episode</h1>
          <div className="w-20"></div> {/* Empty div for balance */}
        </div>
        
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
                        onClick={() => setSortBy(`episode-${i}`)} 
                        className={`font-medium ${sortBy === `episode-${i}` ? 'text-blue-600' : ''}`}
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
                  <tr 
                    key={chef.id} 
                    className={`hover:bg-gray-50 ${chef.eliminated ? 'text-gray-400' : ''} ${chef.is_winner ? 'bg-yellow-50 font-medium' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {chef.name}
                      {chef.is_winner && <span className="ml-2 text-yellow-600 text-sm">(Winner)</span>}
                      {chef.eliminated && !chef.is_winner && <span className="ml-2 text-gray-500 text-sm">(Eliminated)</span>}
                      {chef.in_finale && !chef.is_winner && !chef.eliminated && <span className="ml-2 text-blue-500 text-sm">(Finalist)</span>}
                    </td>
                    {chef.scores.map((_, i) => renderScoreCell(chef, i))}
                    <td className="px-4 py-3 text-center font-bold">{chef.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Scoring Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Quickfire Challenges</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Winner: +3 points 🔥</li>
                <li>Top section: +1 point</li>
                <li>Bottom section: -1 point</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Elimination Challenges</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Winner: +5 points 🏆</li>
                <li>Top section: +1 point</li>
                <li>Bottom section: -1 point</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Finale Bonuses</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Making it to finale: +5 points</li>
                <li>Top Chef Winner: +10 points</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefScoresPage;