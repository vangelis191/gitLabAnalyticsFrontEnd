import React from 'react';
import { Box, Button, Text, VStack, HStack } from '@chakra-ui/react';

const DevTokenButton: React.FC = () => {
  const setDevToken = () => {
    localStorage.setItem('clerk-token', 'dev-test-token-12345');
    window.location.reload();
  };

  const clearToken = () => {
    localStorage.removeItem('clerk-token');
    window.location.reload();
  };

  const currentToken = localStorage.getItem('clerk-token');

  return (
    <Box 
      position="fixed" 
      bottom="20px" 
      right="20px" 
      zIndex={1000}
      bg="yellow.100"
      border="2px solid"
      borderColor="yellow.400"
      borderRadius="md"
      p="3"
      boxShadow="lg"
    >
      <VStack gap="2" align="stretch">
        <Text fontSize="xs" fontWeight="bold" color="yellow.800" textAlign="center">
          🔧 DEV MODE
        </Text>
        
        <HStack gap="2">
          <Button 
            size="xs" 
            colorScheme="yellow" 
            onClick={setDevToken}
            variant="solid"
          >
            Set Dev Token
          </Button>
          
          <Button 
            size="xs" 
            colorScheme="red" 
            onClick={clearToken}
            variant="outline"
          >
            Clear Token
          </Button>
        </HStack>
        
        <Text fontSize="xs" color="yellow.700" textAlign="center">
          Token: {currentToken ? '✅ Set' : '❌ Not Set'}
        </Text>
        
        <Text fontSize="xs" color="yellow.600" textAlign="center">
          For development only!
        </Text>
      </VStack>
    </Box>
  );
};

export default DevTokenButton; 