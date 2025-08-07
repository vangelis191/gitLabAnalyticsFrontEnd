import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { tokenManager } from '../utils/tokenManager';

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't parse it
  }
};

export const useAuth = () => {
  const { isSignedIn, getToken, userId, signOut: clerkSignOut } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const updateToken = async () => {
      console.log('🔐 useAuth: isSignedIn =', isSignedIn);
      
      if (isSignedIn) {
        try {
          console.log(' Getting token from Clerk...');
          // Get the JWT token from Clerk - WAIT for it to complete!
          const token = await getToken();
          console.log('Token received:', token ? `"${token.substring(0, 50)}..."` : 'null');
          console.log('Token length:', token ? token.length : 0);
          
          if (token) {
            // Check if token is expired
            if (isTokenExpired(token)) {
              console.log('⚠️ Token is expired, getting new one...');
              // Token is expired, try to get a fresh one
              const freshToken = await getToken();
              if (freshToken && !isTokenExpired(freshToken)) {
                localStorage.setItem('clerk-token', freshToken);
                tokenManager.setToken(freshToken);
                setTokenReady(true);
                console.log(' Fresh token stored in localStorage');
              } else {
                console.log(' Could not get fresh token');
                localStorage.removeItem('clerk-token');
                tokenManager.setToken(null);
                setTokenReady(false);
              }
            } else {
              // Token is valid, store it
              localStorage.setItem('clerk-token', token);
              tokenManager.setToken(token);
              setTokenReady(true);
              console.log('Valid token stored in localStorage');
            }
            console.log(' localStorage check:', localStorage.getItem('clerk-token') ? 'EXISTS' : 'NOT FOUND');
          } else {
            console.log(' No token received from Clerk');
            localStorage.removeItem('clerk-token');
            tokenManager.setToken(null);
            setTokenReady(false);
          }
        } catch (error) {
          console.error(' Error getting Clerk token:', error);
          localStorage.removeItem('clerk-token');
        }
      } else {
        console.log('User not signed in, clearing token');
        // Clear token when user is not signed in
        localStorage.removeItem('clerk-token');
        tokenManager.setToken(null);
        setTokenReady(false);
      }
      setIsLoading(false);
    };

    // Call the async function immediately
    updateToken();

    // Set up interval to check token expiration every 5 minutes
    const tokenCheckInterval = setInterval(async () => {
      if (isSignedIn) {
        const storedToken = localStorage.getItem('clerk-token');
        if (storedToken && isTokenExpired(storedToken)) {
          console.log('Token expired, refreshing...');
          await updateToken();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [isSignedIn, getToken]);

  const signOut = async () => {
    console.log('Signing out...');
    // Clear local storage and token manager
    localStorage.removeItem('clerk-token');
    tokenManager.setToken(null);
    setTokenReady(false);
    
    // Call Clerk's signOut to properly sign out the user
    try {
      await clerkSignOut();
      console.log('Successfully signed out from Clerk');
    } catch (error) {
      console.error(' Error signing out from Clerk:', error);
    }
  };

  return {
    isSignedIn,
    userId,
    isLoading,
    tokenReady,
    signOut,
    getToken
  };
}; 