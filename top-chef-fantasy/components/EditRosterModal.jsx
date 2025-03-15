// components/EditRosterModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const EditRosterModal = ({ isOpen, onClose, team }) => {
  const [availableChefs, setAvailableChefs] = useState([]);
  const [teamChefs, setTeamChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch available chefs and current team roster
  useEffect(() => {
    if (isOpen && team) {
      const fetchData = async () => {
        setLoading(true);
        
        // Get all current season chefs
        const { data: allChefs, error: chefsError } = await supabase
          .from('chefs')
          .select('*')
          .eq('current_season', true)
          .order('name');
        
        if (chefsError) {
          console.error('Error fetching chefs:', chefsError);
          setLoading(false);
          return;
        }
        
        // Get current team's chefs
        const { data: currentTeamChefs, error: teamChefsError } = await supabase
          .from('team_chefs')
          .select('chef_id')
          .eq('team_id', team.id);
        
        if (teamChefsError) {
          console.error('Error fetching team chefs:', teamChefsError);
          setLoading(false);
          return;
        }
        
        // Create array of chef IDs that are already on the team
        const teamChefIds = currentTeamChefs.map(tc => tc.chef_id);
        
        // Get detailed info for team chefs
        const { data: teamChefDetails, error: detailsError } = await supabase
          .from('chefs')
          .select('*')
          .in('id', teamChefIds)
          .order('name');
        
        if (detailsError) {
          console.error('Error fetching chef details:', detailsError);
          setLoading(false);
          return;
        }
        
        // Filter available chefs (not on this team)
        const availableChefsList = allChefs.filter(chef => 
          !teamChefIds.includes(chef.id)
        );
        
        setAvailableChefs(availableChefsList);
        setTeamChefs(teamChefDetails || []);
        setLoading(false);
      };
      
      fetchData();
    }
  }, [isOpen, team]);

  // Add chef to team
  const addChefToTeam = async (chefId) => {
    if (teamChefs.length >= 3) {
      setMessage({ 
        text: 'Teams can have a maximum of 3 chefs', 
        type: 'error' 
      });
      return;
    }
    
    setSaving(true);
    
    // Insert into team_chefs junction table
    const { error } = await supabase
      .from('team_chefs')
      .insert([{ team_id: team.id, chef_id: chefId }]);
    
    if (error) {
      console.error('Error adding chef to team:', error);
      setMessage({ text: 'Error adding chef to team', type: 'error' });
      setSaving(false);
      return;
    }
    
    // Update UI
    const chefToAdd = availableChefs.find(chef => chef.id === chefId);
    setTeamChefs([...teamChefs, chefToAdd]);
    setAvailableChefs(availableChefs.filter(chef => chef.id !== chefId));
    setMessage({ text: 'Chef added to team', type: 'success' });
    setSaving(false);
  };
  
  // Remove chef from team
  const removeChefFromTeam = async (chefId) => {
    setSaving(true);
    
    // Delete from team_chefs junction table
    const { error } = await supabase
      .from('team_chefs')
      .delete()
      .eq('team_id', team.id)
      .eq('chef_id', chefId);
    
    if (error) {
      console.error('Error removing chef from team:', error);
      setMessage({ text: 'Error removing chef from team', type: 'error' });
      setSaving(false);
      return;
    }
    
    // Update UI
    const chefToRemove = teamChefs.find(chef => chef.id === chefId);
    setAvailableChefs([...availableChefs, chefToRemove]);
    setTeamChefs(teamChefs.filter(chef => chef.id !== chefId));
    setMessage({ text: 'Chef removed from team', type: 'success' });
    setSaving(false);
  };
  
  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            Edit Team Roster: {team?.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {message.text && (
          <div className={`mx-4 mt-4 p-3 rounded-md ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {loading ? (
          <div className="p-8 text-center">
            <p>Loading roster information...</p>
          </div>
        ) : (
          <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Current Team ({teamChefs.length}/3)</h3>
              {teamChefs.length === 0 ? (
                <p className="text-gray-500 italic">No chefs on this team yet</p>
              ) : (
                <ul className="space-y-2">
                  {teamChefs.map(chef => (
                    <li key={chef.id} className="flex justify-between items-center bg-blue-50 p-3 rounded-md">
                      <span>{chef.name}</span>
                      <button
                        onClick={() => removeChefFromTeam(chef.id)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Available Chefs</h3>
              {availableChefs.length === 0 ? (
                <p className="text-gray-500 italic">No available chefs</p>
              ) : (
                <ul className="space-y-2">
                  {availableChefs.map(chef => (
                    <li key={chef.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <span>{chef.name}</span>
                      <button
                        onClick={() => addChefToTeam(chef.id)}
                        disabled={saving || teamChefs.length >= 3}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        Add to Team
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRosterModal;