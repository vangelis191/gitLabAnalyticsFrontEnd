import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const { isSignedIn, getToken, userId, signOut: clerkSignOut } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Expose getToken function globally for axios interceptor and get initial token
  useEffect(() => {
    const setupToken = async () => {
      if (getToken) {
        (window as unknown as { __clerkGetToken?: () => Promise<string | null> }).__clerkGetToken = getToken;
        
        // Get initial token and store in localStorage for immediate use
        if (isSignedIn) {
          try {
            const token = await getToken();
            if (token) {
              localStorage.setItem('clerk-token', token);
              console.log('Initial token stored in localStorage');
            }
          } catch (error) {
            console.error('Error getting initial token:', error);
          }
        }
      }
    };
    
    setupToken();
    
    return () => {
      // Clean up on unmount
      delete (window as unknown as { __clerkGetToken?: () => Promise<string | null> }).__clerkGetToken;
    };
  }, [getToken, isSignedIn]);

  // Simple loading state management
  useEffect(() => {
    setIsLoading(false);
  }, [isSignedIn]);

  const signOut = async () => {
    console.log('Signing out...');
    // Clear any cached tokens
    localStorage.removeItem('clerk-token');
    
    // Call Clerk's signOut to properly sign out the user
    try {
      await clerkSignOut();
      console.log('Successfully signed out from Clerk');
    } catch (error) {
      console.error('Error signing out from Clerk:', error);
    }
  };

  return {
    isSignedIn,
    userId,
    isLoading,
    signOut,
    getToken
  };
}; 