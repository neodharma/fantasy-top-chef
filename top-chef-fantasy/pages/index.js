// pages/index.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

// Array of pastel color schemes for teams
const pastelColors = [
  {
    textColor: "text-sky-600",
    accentText: "text-sky-700",
    border: "border-sky-100"
  },
  {
    textColor: "text-blue-600",
    accentText: "text-blue-700",
    border: "border-blue-100"
  },
  {
    textColor: "text-emerald-600",
    accentText: "text-emerald-700",
    border: "border-emerald-100"
  },
  {
    textColor: "text-purple-600",
    accentText: "text-purple-700",
    border: "border-purple-100"
  },
  {
    textColor: "text-amber-600",
    accentText: "text-amber-700",
    border: "border-amber-100"
  },
  {
    textColor: "text-pink-600",
    accentText: "text-pink-700",
    border: "border-pink-100"
  },
  {
    textColor: "text-teal-600",
    accentText: "text-teal-700",
    border: "border-teal-100"
  },
  {
    textColor: "text-indigo-600",
    accentText: "text-indigo-700",
    border: "border-indigo-100"
  }
];

// Function to get a color scheme based on team ID
const getTeamColorScheme = (teamId) => {
  const colorIndex = (teamId - 1) % pastelColors.length;
  return pastelColors[colorIndex];
};

const HomePage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      
      // Get all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('id');
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        setLoading(false);
        return;
      }
      
      // For each team, get detailed chef information and scores
      const teamsWithDetails = await Promise.all(
        teamsData.map(async (team) => {
          // Get team's chefs
          const { data: teamChefs, error: teamChefsError } = await supabase
            .from('team_chefs')
            .select('chef_id')
            .eq('team_id', team.id);
          
          if (teamChefsError) {
            console.error(`Error fetching chefs for team ${team.id}:`, teamChefsError);
            return { ...team, chefs: [], totalPoints: 0 };
          }
          
          if (!teamChefs.length) {
            return { ...team, chefs: [], totalPoints: 0 };
          }
          
          const chefIds = teamChefs.map(tc => tc.chef_id);
          
          // Get chef details
          const { data: chefs, error: chefsError } = await supabase
            .from('chefs')
            .select('*')
            .in('id', chefIds);
          
          if (chefsError) {
            console.error(`Error fetching chef details for team ${team.id}:`, chefsError);
            return { ...team, chefs: [], totalPoints: 0 };
          }
          
          // For each chef, get their scores
          const chefsWithScores = await Promise.all(
            chefs.map(async (chef) => {
              const { data: scores, error: scoresError } = await supabase
                .from('chef_scores')
                .select('score')
                .eq('chef_id', chef.id);
              
              if (scoresError) {
                console.error(`Error fetching scores for chef ${chef.id}:`, scoresError);
                return { ...chef, totalPoints: 0 };
              }
              
              const totalPoints = scores ? scores.reduce((sum, s) => sum + s.score, 0) : 0;
              
              return {
                ...chef,
                totalPoints
              };
            })
          );
          
          // Calculate team total
          const teamTotal = chefsWithScores.reduce((sum, chef) => sum + chef.totalPoints, 0);
          
          return {
            ...team,
            chefs: chefsWithScores,
            totalPoints: teamTotal
          };
        })
      );
      
      // Sort teams by total points (highest first)
      const sortedTeams = teamsWithDetails.sort((a, b) => b.totalPoints - a.totalPoints);
      
      setTeams(sortedTeams);
      setLoading(false);
    }
    
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-3 px-3">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-gray-700 mb-2 text-sm">Season 1 (well, 22) - Current Standings</p>

        <div className="text-center mb-3">
          <Link href="/chef-scores" className="text-blue-500 hover:underline text-sm">
            View Chef Performance By Episode →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teams.map((team, index) => {
            const colorScheme = getTeamColorScheme(team.id);
            return (
              <Card key={team.id} className={`${index === 0 ? "border-2 border-yellow-400" : "border border-gray-200"} shadow-sm bg-white`}>
                <CardHeader className="pb-0 px-3 py-2 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className={`text-base ${colorScheme.textColor}`}>{team.name}</CardTitle>
                      <p className="text-xs text-gray-500">Owner: {team.owner}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${colorScheme.textColor}`}>{team.totalPoints} pts</span>
                      <p className="text-xs text-gray-500">Rank: #{index + 1}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed border-collapse bg-white">
                      <thead>
                        <tr>
                          <th className="w-1/2 px-2 py-1 text-left border border-gray-200 font-medium text-gray-700 bg-gray-50 text-sm">Chef</th>
                          <th className="w-1/4 px-2 py-1 text-center border border-gray-200 font-medium text-gray-700 bg-gray-50 text-sm">Status</th>
                          <th className="w-1/4 px-2 py-1 text-right border border-gray-200 font-medium text-gray-700 bg-gray-50 text-sm">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.chefs.length > 0 ? (
                          team.chefs.map((chef) => (
                            <tr key={chef.id}>
                              <td className="px-2 py-1 border border-gray-200 font-medium text-sm">{chef.name}</td>
                              <td className="px-2 py-1 text-center border border-gray-200">
                                {chef.eliminated ? (
                                  <span className="inline-block px-1 bg-red-100 text-red-800 rounded-full text-xs">
                                    Eliminated
                                  </span>
                                ) : (
                                  <span className="inline-block px-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Active
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-1 text-right border border-gray-200 font-medium text-sm">{chef.totalPoints}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-2 py-1 border border-gray-200 text-center text-gray-500 italic text-sm">
                              No chefs on team roster
                            </td>
                          </tr>
                        )}
                        <tr className="bg-gray-50">
                          <td colSpan="2" className={`px-2 py-1 border border-gray-200 text-right font-bold ${colorScheme.accentText} text-sm`}>Team Total:</td>
                          <td className={`px-2 py-1 text-right border border-gray-200 font-bold ${colorScheme.accentText} text-sm`}>{team.totalPoints}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;