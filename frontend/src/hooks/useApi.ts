import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import GitLabAnalyticsAPI from '../services/api';

export const useApi = () => {
  const { getToken } = useAuth();

  // Set up token in localStorage when user is authenticated
  useEffect(() => {
    const setupToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          localStorage.setItem('clerk-token', token);
        } else {
          localStorage.removeItem('clerk-token');
        }
      } catch (error) {
        console.error('Error setting up token:', error);
        localStorage.removeItem('clerk-token');
      }
    };

    setupToken();
  }, [getToken]);

  return GitLabAnalyticsAPI;
};

export default useApi; 