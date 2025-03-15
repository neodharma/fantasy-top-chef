import { supabase } from './supabase'

// Get all teams with their chefs
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
      
      const totalPoints = scores.reduce((sum, scoreObj) => sum + scoreObj.score, 0)
      
      return {
        ...team,
        chefs: chefs.map(chef => chef.name),
        totalPoints
      }
    })
  )
  
  return teamsWithChefs
}

// Get all chef scores by episode
export async function getChefScores() {
  // Get all chefs
  const { data: chefs, error: chefsError } = await supabase
    .from('chefs')
    .select('*')
    .eq('current_season', true)
  
  if (chefsError) {
    console.error('Error fetching chefs:', chefsError)
    return []
  }
  
  // Get all episodes
  const { data: episodes, error: episodesError } = await supabase
    .from('episodes')
    .select('*')
    .order('episode_number', { ascending: true })
  
  if (episodesError) {
    console.error('Error fetching episodes:', episodesError)
    return []
  }
  
  // For each chef, get their scores for each episode
  const chefsWithScores = await Promise.all(
    chefs.map(async (chef) => {
      const { data: scores, error: scoresError } = await supabase
        .from('chef_scores')
        .select('*, episodes!inner(*)')
        .eq('chef_id', chef.id)
      
      if (scoresError) {
        console.error(`Error fetching scores for chef ${chef.id}:`, scoresError)
        return {
          id: chef.id,
          name: chef.name,
          scores: Array(episodes.length).fill(0)
        }
      }
      
      // Map scores to episodes
      const episodeScores = episodes.map((episode) => {
        const scoreObj = scores.find(s => s.episodes.id === episode.id)
        return scoreObj ? scoreObj.score : 0
      })
      
      return {
        id: chef.id,
        name: chef.name,
        scores: episodeScores,
        totalPoints: episodeScores.reduce((sum, score) => sum + score, 0)
      }
    })
  )
  
  return { chefs: chefsWithScores, episodes }
}