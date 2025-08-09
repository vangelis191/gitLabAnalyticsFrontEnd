import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const { isSignedIn, getToken, userId, signOut: clerkSignOut } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Expose getToken function globally for axios interceptor and get initial token
  useEffect(() => {
    const setupToken = async () => {
      if (getToken) {
        // Store the getToken function globally for axios interceptor
        (window as unknown as { __clerkGetToken?: () => Promise<string | null> }).__clerkGetToken = getToken;
        console.log('🔧 Global getToken function set up');
        
        // Get initial token and store in localStorage for immediate use
        if (isSignedIn) {
          try {
            const token = await getToken();
            if (token) {
              localStorage.setItem('clerk-token', token);
              console.log('🎫 Initial token stored in localStorage');
              console.log('🔍 Token preview:', token.substring(0, 20) + '...');
            } else {
              console.warn('⚠️ No initial token received from Clerk');
            }
          } catch (error) {
            console.error('❌ Error getting initial token:', error);
          }
        } else {
          console.log('👤 User not signed in, skipping token setup');
        }
      } else {
        console.warn('⚠️ getToken function not available');
      }
    };
    
    setupToken();
    
    return () => {
      // Clean up on unmount
      delete (window as unknown as { __clerkGetToken?: () => Promise<string | null> }).__clerkGetToken;
      console.log('🧹 Cleaned up global getToken function');
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