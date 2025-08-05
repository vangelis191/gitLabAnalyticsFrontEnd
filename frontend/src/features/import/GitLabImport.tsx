import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Input,
  Button,
  Textarea,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import useApi from '../../hooks/useApi';
import type { GitLabImportRequest, GitLabImportResponse } from '../../services/api';

const GitLabImport: React.FC = () => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<GitLabImportResponse | null>(null);
  const [formData, setFormData] = useState<GitLabImportRequest>({
    project_ids: [],
    gitlab_url: 'https://gitlab.com',
    access_token: '',
  });

  const handleProjectIdsChange = (value: string) => {
    const ids = value
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
    
    setFormData(prev => ({
      ...prev,
      project_ids: ids
    }));
  };

  const showToast = (title: string, description: string, status: 'success' | 'error') => {
    // Simple toast implementation using console.log for now
    console.log(`${status.toUpperCase()}: ${title} - ${description}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.project_ids.length === 0) {
      showToast('Validation Error', 'Please enter at least one project ID', 'error');
      return;
    }

    if (!formData.access_token) {
      showToast('Validation Error', 'Please enter your GitLab access token', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await api.importFromGitLab(formData);
      setImportResult(result);
      showToast('Import Successful', result.message, 'success');
    } catch (error) {
      console.error('Import error:', error);
      showToast('Import Failed', 'Failed to import data from GitLab. Please check your credentials and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>GitLab Data Import</Heading>
          <Text color="gray.600">Import project data from GitLab API to analyze your repositories</Text>
        </Box>

        {/* Import Form */}
        <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
          <Box mb={4}>
            <Heading size="md">Import Configuration</Heading>
          </Box>
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={2}>GitLab URL</Text>
                <Input
                  type="url"
                  value={formData.gitlab_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, gitlab_url: e.target.value }))}
                  placeholder="https://gitlab.com"
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Your GitLab instance URL (default: https://gitlab.com)
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>Project IDs</Text>
                <Textarea
                  value={formData.project_ids.join(', ')}
                  onChange={(e) => handleProjectIdsChange(e.target.value)}
                  placeholder="123, 456, 789"
                  rows={3}
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Comma-separated list of GitLab project IDs to import
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>Access Token</Text>
                <Input
                  type="password"
                  value={formData.access_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                  placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Your GitLab personal access token with read permissions
                </Text>
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" mr={2} /> : null}
                Import from GitLab
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Import Results */}
        {importResult && (
          <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Import Results</Heading>
              <Badge colorScheme="green" variant="subtle">
                Success
              </Badge>
            </HStack>
            
            <VStack gap={4} align="stretch">
              <Box p={4} bg="green.50" border="1px" borderColor="green.200" borderRadius="md">
                <Text color="green.800" fontWeight="semibold">Import Completed!</Text>
                <Text color="green.700">{importResult.message}</Text>
              </Box>

              {importResult.results.length > 0 && (
                <Box>
                  <Heading size="sm" mb={3}>Import Summary</Heading>
                  <VStack gap={3} align="stretch">
                    {importResult.results.map((result) => (
                      <Box key={result.project_id} p={4} bg="gray.50" borderRadius="md">
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Project ID</Text>
                            <Text fontWeight="bold">{result.project_id}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Milestones Imported</Text>
                            <Text fontWeight="bold">{result.milestones_imported}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Issues Imported</Text>
                            <Text fontWeight="bold">{result.issues_imported}</Text>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        )}

        {/* Instructions */}
        <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>How to Get GitLab Access Token</Heading>
          
          <VStack gap={4} align="stretch">
            <Text>
              To import data from GitLab, you need a personal access token with the following permissions:
            </Text>
            
            <Box>
              <Text fontWeight="semibold" mb={2}>Required Scopes:</Text>
              <VStack align="start" gap={1}>
                <Text>• <code>read_api</code> - Read access to the API</Text>
                <Text>• <code>read_repository</code> - Read access to repository</Text>
                <Text>• <code>read_user</code> - Read access to user information</Text>
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={2}>Steps to create a token:</Text>
              <VStack align="start" gap={1}>
                <Text>1. Go to GitLab → Settings → Access Tokens</Text>
                <Text>2. Create a new token with the required scopes</Text>
                <Text>3. Copy the token and paste it in the form above</Text>
                <Text>4. Enter your project IDs (comma-separated)</Text>
                <Text>5. Click "Import from GitLab"</Text>
              </VStack>
            </Box>

            <Box p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
              <Text color="blue.800" fontWeight="semibold">Security Note</Text>
              <Text color="blue.700">
                Your access token will be used only for this import and is not stored permanently.
                Make sure to use a token with minimal required permissions.
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default GitLabImport; 