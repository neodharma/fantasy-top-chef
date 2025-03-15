import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { teams as sampleTeams } from '../data/teams';
// Then use sampleTeams instead of the hardcoded array

const HomePage = () => {
  const [teams, setTeams] = useState(sampleTeams);
  
  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Top Chef Fantasy League</h1>
        <p className="text-center text-gray-600 mb-8">Season 21 - Current Standings</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedTeams.map((team, index) => (
            <Card key={team.id} className={index === 0 ? "border-2 border-yellow-400" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{team.name}</CardTitle>
                  <span className="text-2xl font-bold">{team.totalPoints} pts</span>
                </div>
                <p className="text-sm text-gray-500">Owner: {team.owner}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Team Roster:</p>
                  <ul className="pl-6 list-disc">
                    {team.chefs.map((chef, i) => (
                      <li key={i}>{chef}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <a href="/chef-scores" className="text-blue-600 hover:underline text-lg">
            View Chef Performance By Episode →
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;