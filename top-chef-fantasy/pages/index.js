import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTeams } from '../lib/api';

const HomePage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      const teamsData = await getTeams();
      setTeams(teamsData);
      setLoading(false);
    }
    
    fetchTeams();
  }, []);
  
  // Sort teams by points (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading teams...</p>
      </div>
    );
  }

  return (
    // Rest of your component remains the same, but using sortedTeams
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
          <Link href="/chef-scores" className="text-blue-600 hover:underline text-lg">
            View Chef Performance By Episode →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;