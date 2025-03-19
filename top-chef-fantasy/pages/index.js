// pages/index.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import ChefStatus from '../components/ChefStatus';

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
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-1">Top Chef Fantasy League</h1>
        <p className="text-center text-gray-600 mb-2">Season 21 - Current Standings</p>
        
        <div className="text-center mb-4">
          <Link href="/chef-scores" className="text-blue-600 hover:underline">
            View Chef Performance By Episode →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {teams.map((team, index) => (
            <Card key={team.id} className={index === 0 ? "border-2 border-yellow-400" : ""}>
              <CardHeader className="pb-2 px-4 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <p className="text-xs text-gray-500">Owner: {team.owner}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">{team.totalPoints} pts</span>
                    <p className="text-xs text-gray-500">Rank: #{index + 1}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left border border-gray-300 font-medium text-gray-700 bg-white">Chef</th>
                        <th className="px-3 py-2 text-center border border-gray-300 font-medium text-gray-700 bg-white">Status</th>
                        <th className="px-3 py-2 text-center border border-gray-300 font-medium text-gray-700 bg-white">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.chefs.length > 0 ? (
                        team.chefs.map((chef) => (
                          <tr key={chef.id}>
                            <td className="px-3 py-2 border border-gray-300 font-medium">{chef.name}</td>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              <ChefStatus status={chef.status || (chef.eliminated ? 'eliminated' : 'active')} />
                            </td>
                            <td className="px-3 py-2 text-center border border-gray-300 font-medium">{chef.totalPoints}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-3 py-2 border border-gray-300 text-center text-gray-500 italic">
                            No chefs on team roster
                          </td>
                        </tr>
                      )}
                      <tr className="bg-gray-100">
                        <td colSpan="2" className="px-3 py-2 border border-gray-300 text-right font-bold">Team Total:</td>
                        <td className="px-3 py-2 text-center border border-gray-300 font-bold">{team.totalPoints}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Status Legend</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center">
              <ChefStatus status="active" />
              <span className="ml-2">Active in main competition</span>
            </div>
            <div className="flex items-center">
              <ChefStatus status="lck" />
              <span className="ml-2">In Last Chance Kitchen</span>
            </div>
            <div className="flex items-center">
              <ChefStatus status="eliminated" />
              <span className="ml-2">Eliminated from competition</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;