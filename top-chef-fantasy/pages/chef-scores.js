import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { chefs as sampleChefData } from '../data/chefs';
// Then use sampleChefData instead of the hardcoded array

const ChefScoresPage = () => {
  const [chefData, setChefData] = useState(sampleChefData);
  const [sortBy, setSortBy] = useState('totalPoints'); // Default sort by total points
  
  // Get number of episodes from first chef's scores
  const episodeCount = chefData[0].scores.length;
  
  // Calculate total points for each chef
  const chefsWithTotals = chefData.map(chef => ({
    ...chef,
    totalPoints: chef.scores.reduce((sum, score) => sum + score, 0)
  }));
  
  // Sort chefs based on selected criteria
  const sortedChefs = [...chefsWithTotals].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <a href="/" className="text-blue-600 hover:underline">← Back to Standings</a>
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
                  {Array.from({ length: episodeCount }, (_, i) => (
                    <th key={i} className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setSortBy(`episode-${i+1}`)} 
                        className={`font-medium ${sortBy === `episode-${i+1}` ? 'text-blue-600' : ''}`}
                      >
                        Ep {i+1}
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
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-3">Scoring Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Points Awarded For:</h3>
              <ul className="space-y-1 pl-5 list-disc">
                <li>Winning Quickfire: +5 points</li>
                <li>Winning Elimination Challenge: +10 points</li>
                <li>Top 3 placement: +3 points</li>
                <li>Creative dish praised by judges: +2 points</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Points Deducted For:</h3>
              <ul className="space-y-1 pl-5 list-disc">
                <li>Bottom 3 placement: -2 points</li>
                <li>Dish criticized by judges: -1 point</li>
                <li>Elimination: -5 points</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefScoresPage;