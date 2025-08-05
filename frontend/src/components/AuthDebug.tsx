import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Box, Text, VStack, Button } from '@chakra-ui/react';

const AuthDebug: React.FC = () => {
  const { isSignedIn, getToken, userId } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const clerkToken = await getToken();
      setToken(clerkToken);
      setLocalStorageToken(localStorage.getItem('clerk-token'));
    } catch (error) {
      console.error('Error getting token:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const testApiCall = async () => {
    try {
      const response = await fetch('http://localhost:5001/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API call successful:', data);
        alert('API call successful! Check console for data.');
      } else {
        const errorData = await response.json();
        console.error('API call failed:', errorData);
        alert(`API call failed: ${response.status} - ${errorData.error}`);
      }
    } catch (error) {
      console.error('API call error:', error);
      alert(`API call error: ${error}`);
    }
  };

  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <VStack gap={3} align="start">
        <Text fontWeight="bold">Authentication Debug</Text>
        
        <Text>Is Signed In: {isSignedIn ? 'Yes' : 'No'}</Text>
        <Text>User ID: {userId || 'None'}</Text>
        <Text>Token from Clerk: {token ? `${token.substring(0, 20)}...` : 'None'}</Text>
        <Text>Token in localStorage: {localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'None'}</Text>
        
        <Button 
          onClick={checkAuth} 
          loading={loading}
          colorScheme="blue"
          size="sm"
        >
          Refresh Auth Status
        </Button>
        
        {token && (
          <Button 
            onClick={testApiCall}
            colorScheme="green"
            size="sm"
          >
            Test API Call
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default AuthDebug; 