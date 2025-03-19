// lib/api.js
import { supabase } from './supabase'

// Get all teams with their chefs and calculated scores
export async function getTeams() {
  // Get teams
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
  
  if (teamsError) {
    console.error('Error fetching teams:', teamsError)
    return []
  }
  
  // For each team, get their chefs
  const teamsWithChefs = await Promise.all(
    teams.map(async (team) => {
      const { data: teamChefs, error: teamChefsError } = await supabase
        .from('team_chefs')
        .select('chef_id')
        .eq('team_id', team.id)
      
      if (teamChefsError) {
        console.error(`Error fetching chefs for team ${team.id}:`, teamChefsError)
        return { ...team, chefs: [], totalPoints: 0 }
      }
      
      const chefIds = teamChefs.map(tc => tc.chef_id)
      
      // Get chef details
      const { data: chefs, error: chefsError } = await supabase
        .from('chefs')
        .select('*')
        .in('id', chefIds)
      
      if (chefsError) {
        console.error(`Error fetching chef details for team ${team.id}:`, chefsError)
        return { ...team, chefs: [], totalPoints: 0 }
      }
      
      // Calculate total points for all chefs in the team
      const { data: scores, error: scoresError } = await supabase
        .from('chef_scores')
        .select('score')
        .in('chef_id', chefIds)
      
      if (scoresError) {
        console.error(`Error fetching scores for team ${team.id}:`, scoresError)
        return { ...team, chefs: chefs, totalPoints: 0 }
      }
      
      const totalPoints = scores ? scores.reduce((sum, scoreObj) => sum + scoreObj.score, 0) : 0
      
      return {
        ...team,
        chefs: chefs.map(chef => chef.name),
        totalPoints
      }
    })
  )
  
  return teamsWithChefs
}

// Get all chef scores by episode directly from the chef_scores table
export async function getChefScores() {
  try {
    // Get all episodes
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('*')
      .order('episode_number', { ascending: true });
    
    if (episodesError) throw episodesError;
    
    // Get all chefs
    const { data: chefs, error: chefsError } = await supabase
      .from('chefs')
      .select('*')
      .order('name');
    
    if (chefsError) throw chefsError;
    
    // Get all scores
    const { data: scores, error: scoresError } = await supabase
      .from('chef_scores')
      .select('*');
    
    if (scoresError) throw scoresError;
    
    // Process chefs with their scores
    const chefsWithScores = chefs.map(chef => {
      // Map chef scores to episodes
      const episodeScores = episodes.map(episode => {
        const scoreEntry = scores.find(
          s => s.chef_id === chef.id && s.episode_id === episode.id
        ) || { score: 0 };
        
        return scoreEntry.score;
      });
      
      return {
        id: chef.id,
        name: chef.name,
        eliminated: chef.eliminated,
        in_finale: chef.in_finale,
        is_winner: chef.is_winner,
        scores: episodeScores,
        totalPoints: episodeScores.reduce((sum, score) => sum + score, 0)
      };
    });
    
    return { chefs: chefsWithScores, episodes };
  } catch (error) {
    console.error('Error fetching chef scores:', error);
    return { chefs: [], episodes: [] };
  }
}