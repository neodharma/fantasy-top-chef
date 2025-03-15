// lib/auth-utils.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Simple admin password check - in a real app, use a proper authentication system
const ADMIN_PASSWORD = 'topchef2025'; // Change this to a secure password

// Custom hook for admin authentication
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by looking for a token in localStorage
    const token = localStorage.getItem('adminToken');
    if (token === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  // Function to handle login
  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', password);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    router.push('/admin-login');
  };

  return { isAuthenticated, isLoading, login, logout };
}