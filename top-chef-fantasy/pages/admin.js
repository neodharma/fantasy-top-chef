// pages/admin.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../lib/auth-utils';
import EditRosterModal from '../components/EditRosterModal';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('chefs');
  const [chefs, setChefs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
// Add these at the top of your AdminPage component, with your other state variables
const [editingTeam, setEditingTeam] = useState(null);
const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  
  const fetchTeamRosters = async () => {
    const updatedTeams = await Promise.all(
      teams.map(async (team) => {
        // Get team's chefs
        const { data: teamChefs, error: teamChefsError } = await supabase
          .from('team_chefs')
          .select('chef_id')
          .eq('team_id', team.id);
        
        if (teamChefsError) {
          console.error(`Error fetching chefs for team ${team.id}:`, teamChefsError);
          return { ...team, roster: [] };
        }
        
        if (!teamChefs.length) {
          return { ...team, roster: [] };
        }
        
        const chefIds = teamChefs.map(tc => tc.chef_id);
        
        // Get chef details
        const { data: chefs, error: chefsError } = await supabase
          .from('chefs')
          .select('name')
          .in('id', chefIds);
        
        if (chefsError) {
          console.error(`Error fetching chef details for team ${team.id}:`, chefsError);
          return { ...team, roster: [] };
        }
        
        return { 
          ...team, 
          roster: chefs.map(chef => chef.name)
        };
      })
    );
    
    setTeams(updatedTeams);
  };
  // Function to refresh all data
const refreshData = async () => {
  setLoading(true);
  setMessage({ text: 'Refreshing data...', type: 'info' });
  
  try {
    // Fetch chefs
    const { data: chefsData, error: chefsError } = await supabase
      .from('chefs')
      .select('*')
      .order('id');
    
    if (chefsError) throw new Error(`Error fetching chefs: ${chefsError.message}`);
    setChefs(chefsData);
    
    // Fetch teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('id');
    
    if (teamsError) throw new Error(`Error fetching teams: ${teamsError.message}`);
    setTeams(teamsData);
    
    // Fetch episodes
    const { data: episodesData, error: episodesError } = await supabase
      .from('episodes')
      .select('*')
      .order('episode_number');
    
    if (episodesError) throw new Error(`Error fetching episodes: ${episodesError.message}`);
    setEpisodes(episodesData);
    
    // Fetch team rosters
    await fetchTeamRosters();
    
    setMessage({ text: 'Data refreshed successfully!', type: 'success' });
  } catch (error) {
    console.error('Error refreshing data:', error);
    setMessage({ text: `Error refreshing data: ${error.message}`, type: 'error' });
  }
  
  setLoading(false);
};

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin-login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Form states
  const [newChef, setNewChef] = useState({ name: '' });
  const [newTeam, setNewTeam] = useState({ name: '', owner: '' });
  const [newEpisode, setNewEpisode] = useState({ 
    episode_number: '', 
    title: '', 
    air_date: new Date().toISOString().split('T')[0]
  });
  const [newScore, setNewScore] = useState({
    chef_id: '',
    episode_id: '',
    score: ''
  });

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch chefs
      const { data: chefsData, error: chefsError } = await supabase
        .from('chefs')
        .select('*')
        .order('id');
      
      if (chefsError) {
        console.error('Error fetching chefs:', chefsError);
      } else {
        setChefs(chefsData);
      }
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('id');
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
      } else {
        setTeams(teamsData);
      }
      
      // Fetch episodes
      const { data: episodesData, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .order('episode_number');
      
      if (episodesError) {
        console.error('Error fetching episodes:', episodesError);
      } else {
        setEpisodes(episodesData);
      }
      fetchTeamRosters();
      setLoading(false);
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    if (!isRosterModalOpen && editingTeam) {
      fetchTeamRosters();
    }
  }, [isRosterModalOpen]);

  // Handle form submissions
  const addChef = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('chefs')
      .insert([{ name: newChef.name }])
      .select();
    
    if (error) {
      setMessage({ text: `Error adding chef: ${error.message}`, type: 'error' });
    } else {
      setChefs([...chefs, data[0]]);
      setNewChef({ name: '' });
      setMessage({ text: 'Chef added successfully!', type: 'success' });
    }
  };
  
  const addTeam = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name: newTeam.name, owner: newTeam.owner }])
      .select();
    
    if (error) {
      setMessage({ text: `Error adding team: ${error.message}`, type: 'error' });
    } else {
      setTeams([...teams, data[0]]);
      setNewTeam({ name: '', owner: '' });
      setMessage({ text: 'Team added successfully!', type: 'success' });
    }
  };
  
  const addEpisode = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('episodes')
      .insert([{ 
        episode_number: parseInt(newEpisode.episode_number), 
        title: newEpisode.title,
        air_date: newEpisode.air_date
      }])
      .select();
    
    if (error) {
      setMessage({ text: `Error adding episode: ${error.message}`, type: 'error' });
    } else {
      setEpisodes([...episodes, data[0]]);
      setNewEpisode({ 
        episode_number: '', 
        title: '', 
        air_date: new Date().toISOString().split('T')[0]
      });
      setMessage({ text: 'Episode added successfully!', type: 'success' });
    }
  };
  
  const addScore = async (e) => {
    e.preventDefault();
    
    // Check if score already exists for this chef and episode
    const { data: existingData, error: checkError } = await supabase
      .from('chef_scores')
      .select('*')
      .eq('chef_id', newScore.chef_id)
      .eq('episode_id', newScore.episode_id);
    
    if (checkError) {
      setMessage({ text: `Error checking existing score: ${checkError.message}`, type: 'error' });
      return;
    }
    
    // If score exists, update it
    if (existingData && existingData.length > 0) {
      const { error: updateError } = await supabase
        .from('chef_scores')
        .update({ score: parseInt(newScore.score) })
        .eq('chef_id', newScore.chef_id)
        .eq('episode_id', newScore.episode_id);
      
      if (updateError) {
        setMessage({ text: `Error updating score: ${updateError.message}`, type: 'error' });
      } else {
        setMessage({ text: 'Score updated successfully!', type: 'success' });
      }
    } else {
      // If score doesn't exist, insert it
      const { error: insertError } = await supabase
        .from('chef_scores')
        .insert([{ 
          chef_id: parseInt(newScore.chef_id), 
          episode_id: parseInt(newScore.episode_id),
          score: parseInt(newScore.score)
        }]);
      
      if (insertError) {
        setMessage({ text: `Error adding score: ${insertError.message}`, type: 'error' });
      } else {
        setMessage({ text: 'Score added successfully!', type: 'success' });
      }
    }
    
    setNewScore({ chef_id: '', episode_id: '', score: '' });
  };
  
  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading admin panel...</p>
      </div>
    );
  }

  // If still checking authentication or not authenticated, show loading
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Verifying authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

      <div className="flex justify-between items-center mb-6">
  <div className="flex items-center">
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    <button 
      onClick={refreshData}
      className="ml-4 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
      disabled={loading}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </button>
  </div>
  <div className="flex space-x-4">
    <button 
      onClick={logout}
      className="text-red-600 hover:underline"
    >
      Logout
    </button>
    <Link href="/" className="text-blue-600 hover:underline">
      ← Back to Site
    </Link>
  </div>
</div>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'chefs' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : ''}`}
              onClick={() => setActiveTab('chefs')}
            >
              Manage Chefs
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'teams' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : ''}`}
              onClick={() => setActiveTab('teams')}
            >
              Manage Teams
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'episodes' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : ''}`}
              onClick={() => setActiveTab('episodes')}
            >
              Manage Episodes
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === 'scores' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : ''}`}
              onClick={() => setActiveTab('scores')}
            >
              Update Scores
            </button>
          </div>
          
          <div className="p-6">
            {/* Manage Chefs Tab */}
            {activeTab === 'chefs' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Add New Chef</h2>
                <form onSubmit={addChef} className="mb-8 max-w-md">
                  <div className="mb-4">
                    <label htmlFor="chefName" className="block text-sm font-medium text-gray-700 mb-1">
                      Chef Name
                    </label>
                    <input
                      type="text"
                      id="chefName"
                      value={newChef.name}
                      onChange={(e) => setNewChef({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Chef
                  </button>
                </form>
                
                <h2 className="text-xl font-semibold mb-4">Current Chefs</h2>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
  <tr>
    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Team Name</th>
    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Owner</th>
    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Roster</th>
    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
  </tr>
</thead>
                    <tbody className="divide-y divide-gray-200">
                      {chefs.map((chef) => (
                        <tr key={chef.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{chef.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{chef.name}</td>
                          <td className="px-4 py-3 text-sm">
                            {chef.eliminated ? (
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Eliminated
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Manage Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Add New Team</h2>
                <form onSubmit={addTeam} className="mb-8 max-w-md">
                  <div className="mb-4">
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      id="teamName"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      id="ownerName"
                      value={newTeam.owner}
                      onChange={(e) => setNewTeam({ ...newTeam, owner: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Team
                  </button>
                </form>
                
                <h2 className="text-xl font-semibold mb-4">Current Teams</h2>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Team Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Owner</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                    {teams.map((team) => (
    <tr key={team.id} className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{team.id}</td>
      <td className="px-4 py-3 text-sm font-medium">{team.name}</td>
      <td className="px-4 py-3 text-sm">{team.owner}</td>
      <td className="px-4 py-3 text-sm">
        {team.roster && team.roster.length > 0 ? (
          <ul className="list-disc pl-5 text-xs">
            {team.roster.map((chef, index) => (
              <li key={index}>{chef}</li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500 italic text-xs">No chefs assigned</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        <button 
          className="text-blue-600 hover:text-blue-800"
          onClick={() => {
            setEditingTeam(team);
            setIsRosterModalOpen(true);
          }}
        >
          Edit Roster
        </button>
      </td>
    </tr>
  ))}
</tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Manage Episodes Tab */}
            {activeTab === 'episodes' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Add New Episode</h2>
                <form onSubmit={addEpisode} className="mb-8 max-w-md">
                  <div className="mb-4">
                    <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Episode Number
                    </label>
                    <input
                      type="number"
                      id="episodeNumber"
                      value={newEpisode.episode_number}
                      onChange={(e) => setNewEpisode({ ...newEpisode, episode_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      min="1"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="episodeTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Episode Title
                    </label>
                    <input
                      type="text"
                      id="episodeTitle"
                      value={newEpisode.title}
                      onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="airDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Air Date
                    </label>
                    <input
                      type="date"
                      id="airDate"
                      value={newEpisode.air_date}
                      onChange={(e) => setNewEpisode({ ...newEpisode, air_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Episode
                  </button>
                </form>
                
                <h2 className="text-xl font-semibold mb-4">Current Episodes</h2>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Number</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Air Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {episodes.map((episode) => (
                        <tr key={episode.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{episode.id}</td>
                          <td className="px-4 py-3 text-sm">{episode.episode_number}</td>
                          <td className="px-4 py-3 text-sm font-medium">{episode.title}</td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(episode.air_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Update Scores Tab */}
            {activeTab === 'scores' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Update Chef Scores</h2>
                <form onSubmit={addScore} className="mb-8 max-w-md">
                  <div className="mb-4">
                    <label htmlFor="scoreChef" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Chef
                    </label>
                    <select
                      id="scoreChef"
                      value={newScore.chef_id}
                      onChange={(e) => setNewScore({ ...newScore, chef_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a chef</option>
                      {chefs.map((chef) => (
                        <option key={chef.id} value={chef.id}>{chef.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="scoreEpisode" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Episode
                    </label>
                    <select
                      id="scoreEpisode"
                      value={newScore.episode_id}
                      onChange={(e) => setNewScore({ ...newScore, episode_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select an episode</option>
                      {episodes.map((episode) => (
                        <option key={episode.id} value={episode.id}>
                          Episode {episode.episode_number}: {episode.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="scoreValue" className="block text-sm font-medium text-gray-700 mb-1">
                      Score
                    </label>
                    <input
                      type="number"
                      id="scoreValue"
                      value={newScore.score}
                      onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      min="0"
                      max="20"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Score
                  </button>
                </form>
                
                <h2 className="text-xl font-semibold mb-4">View Score Matrix</h2>
                <p className="mb-4 text-sm text-gray-600">
                  This will be implemented in a future update to show all chef scores across all episodes in a matrix format.
                </p>
              </div>
            )}
</div>
</div>
</div>
</div>
);
};

{/* Edit Roster Modal */}
{isRosterModalOpen && (
    <EditRosterModal
      isOpen={isRosterModalOpen}
      onClose={() => {
        setIsRosterModalOpen(false);
        setEditingTeam(null);
      }}
      team={editingTeam}
    />
  )}

export default AdminPage;