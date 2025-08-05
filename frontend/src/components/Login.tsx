import React, { useState } from 'react';
import { Box, VStack, Text, Input, Button } from '@chakra-ui/react';
import GitLabAnalyticsAPI from '../services/api';

interface LoginProps {
  onLogin: (user: unknown) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await GitLabAnalyticsAPI.generateJWT(email, password);
      
      if (result.success) {
        // Store token in localStorage
        localStorage.setItem('clerk-token', result.token);
        // Call the onLogin callback with user data only
        onLogin(result.user);
      } else {
        setError('Login failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt="50px" p="6" border="1px solid" borderColor="gray.200" borderRadius="md">
      <VStack gap="4" as="form" onSubmit={handleLogin}>
        <Text fontSize="xl" fontWeight="bold">Login to GitLab Analytics</Text>
        
        <VStack gap="2" w="100%">
          <Text fontSize="sm" fontWeight="medium">Email:</Text>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </VStack>

        <VStack gap="2" w="100%">
          <Text fontSize="sm" fontWeight="medium">Password:</Text>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </VStack>

        {error && (
          <Text color="red.500" fontSize="sm">{error}</Text>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          loading={loading}
          disabled={loading}
          w="100%"
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Text fontSize="xs" color="gray.500" textAlign="center">
          This is a development login. Any email/password combination will work.
        </Text>
      </VStack>
    </Box>
  );
};

export default Login; 