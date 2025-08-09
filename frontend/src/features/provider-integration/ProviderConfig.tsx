import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Heading,
  Badge,
  Grid,
  createToaster,
} from '@chakra-ui/react';
import { FiSettings, FiCheck, FiInfo } from 'react-icons/fi';
import GitLabAnalyticsAPI from '../../services/api';
import type { ProviderConfig as ProviderConfigType, ProviderInfo, ConnectionTestResponse, ImportStatusResponse } from '../../services/api';
import { useProject } from '../../hooks/useProject';

const ProviderConfig: React.FC = () => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatusResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionTestResponse | null>(null);
  const [formData, setFormData] = useState({
    provider_type: 'gitlab',
    provider_url: '',
    access_token: '',
    company_name: '',
    company_domain: '',
    provider_config: '',
  });
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { selectedProject } = useProject();
  const toaster = createToaster({
    placement: 'top',
  });

  const loadProviders = useCallback(async () => {
    try {
      const data = await GitLabAnalyticsAPI.getAvailableProviders();
      setProviders(data.providers);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  }, []);

  const loadProjectConfig = useCallback(async () => {
    if (!selectedProject) return;

    try {
      const config = await GitLabAnalyticsAPI.getProjectProviderConfig(selectedProject.id);
      setFormData({
        provider_type: config.provider_type || 'gitlab',
        provider_url: config.provider_url || '',
        access_token: '', // Don't show masked token
        company_name: config.company_name || '',
        company_domain: config.company_domain || '',
        provider_config: config.provider_config ? JSON.stringify(config.provider_config, null, 2) : '',
      });
    } catch (error) {
      console.error('Error loading project config:', error);
    }
  }, [selectedProject]);

  const loadImportStatus = useCallback(async () => {
    if (!selectedProject) return;

    try {
      const status = await GitLabAnalyticsAPI.getImportStatus(selectedProject.id);
      setImportStatus(status);
    } catch (error) {
      console.error('Error loading import status:', error);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectConfig();
      loadImportStatus();
    }
  }, [selectedProject, loadProjectConfig, loadImportStatus]);

  const handleProviderChange = (providerType: string) => {
    const provider = providers.find(p => p.type === providerType);
    setFormData(prev => ({
      ...prev,
      provider_type: providerType,
      provider_url: provider?.default_url || '',
    }));
  };

  const testConnection = async () => {
    if (!selectedProject) return;

    setTestingConnection(true);
    try {
      const testConfig = {
        provider_type: formData.provider_type,
        provider_url: formData.provider_url,
        access_token: formData.access_token,
      };
      const result = await GitLabAnalyticsAPI.testProviderConnection(selectedProject.id, testConfig);
      setConnectionStatus(result);
      
      if (result.connection_status) {
        toaster.create({
          title: 'Connection successful',
          description: 'Provider connection test passed',
          type: 'success',
          duration: 3000,
        });
      } else {
        toaster.create({
          title: 'Connection failed',
          description: 'Unable to connect to provider',
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Connection test failed';
      setConnectionStatus({ connection_status: false, provider_type: formData.provider_type, provider_url: formData.provider_url });
      toaster.create({
        title: 'Connection test failed',
        description: errorMsg,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const saveConfiguration = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      let providerConfig;
      if (formData.provider_config.trim()) {
        try {
          providerConfig = JSON.parse(formData.provider_config);
        } catch {
          toaster.create({
            title: 'Invalid JSON',
            description: 'Provider configuration must be valid JSON',
            type: 'error',
            duration: 5000,
          });
          setLoading(false);
          return;
        }
      }

      const config: ProviderConfigType = {
        provider_type: formData.provider_type,
        provider_url: formData.provider_url,
        access_token: formData.access_token,
        company_name: formData.company_name,
        company_domain: formData.company_domain,
        provider_config: providerConfig,
      };

      await GitLabAnalyticsAPI.updateProjectProviderConfig(selectedProject.id, config);
      await loadProjectConfig();
      await loadImportStatus();

      toaster.create({
        title: 'Configuration saved',
        description: 'Provider configuration updated successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save configuration';
      toaster.create({
        title: 'Error saving configuration',
        description: errorMsg,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = providers.find(p => p.type === formData.provider_type);

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HStack gap={3}>
          <FiSettings size={24} />
          <Heading size="lg">Provider Configuration</Heading>
        </HStack>

        {!selectedProject && (
          <Box bg="yellow.50" border="1px" borderColor="yellow.200" p={4} borderRadius="md">
            <Text color="yellow.800">Please select a project to configure provider settings.</Text>
          </Box>
        )}

        {/* Current Status */}
        {importStatus && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Heading size="md" mb={4}>Current Configuration Status</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
              <VStack align="start" gap={2}>
                <Text fontWeight="medium">Provider Status</Text>
                <HStack>
                  <Badge colorScheme={importStatus.provider_configured ? 'green' : 'red'}>
                    {importStatus.provider_configured ? 'Configured' : 'Not Configured'}
                  </Badge>
                  {importStatus.provider_type && (
                    <Badge variant="outline">{importStatus.provider_type}</Badge>
                  )}
                </HStack>
                {importStatus.provider_url && (
                  <Text fontSize="sm" color="gray.600">{importStatus.provider_url}</Text>
                )}
              </VStack>

              <VStack align="start" gap={2}>
                <Text fontWeight="medium">Connection Status</Text>
                <HStack>
                  <Badge colorScheme={importStatus.provider_connection_status ? 'green' : 'red'}>
                    {importStatus.provider_connection_status ? 'Connected' : 'Disconnected'}
                  </Badge>
                </HStack>
              </VStack>

              <VStack align="start" gap={2}>
                <Text fontWeight="medium">Developers</Text>
                <HStack>
                  <Text>{importStatus.active_developers} active</Text>
                  <Text color="gray.500">/ {importStatus.total_developers} total</Text>
                </HStack>
              </VStack>

              {importStatus.company_name && (
                <VStack align="start" gap={2}>
                  <Text fontWeight="medium">Organization</Text>
                  <Text>{importStatus.company_name}</Text>
                  {importStatus.company_domain && (
                    <Text fontSize="sm" color="gray.600">{importStatus.company_domain}</Text>
                  )}
                </VStack>
              )}
            </Grid>
          </Box>
        )}

        {/* Provider Selection & Configuration */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Heading size="md" mb={4}>Provider Configuration</Heading>
          <VStack gap={6} align="stretch">
            {/* Provider Selection */}
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
              <Box>
                <Text fontWeight="medium" mb={2}>Provider Type *</Text>
                <select
                  value={formData.provider_type}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    width: '100%',
                    backgroundColor: 'white',
                  }}
                >
                  {providers.map((provider) => (
                    <option key={provider.type} value={provider.type}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>Provider URL *</Text>
                <Input
                  value={formData.provider_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_url: e.target.value }))}
                  placeholder={selectedProvider?.default_url}
                />
              </Box>
            </Grid>

              {/* Provider Info */}
              {selectedProvider && (
                <Box bg="blue.50" border="1px" borderColor="blue.200" p={4} borderRadius="md">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold">{selectedProvider.name}</Text>
                    <Text fontSize="sm">{selectedProvider.description}</Text>
                    <HStack gap={2} flexWrap="wrap">
                      <Text fontSize="sm">Supports:</Text>
                      {selectedProvider.supports.map((feature) => (
                        <Badge key={feature} size="sm" variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Authentication */}
              <Box>
                <Text fontWeight="medium" mb={2}>Access Token *</Text>
                <Input
                  type="password"
                  value={formData.access_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                  placeholder="Enter your provider access token"
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {formData.provider_type === 'gitlab' && 'Generate a Personal Access Token in GitLab with API scope'}
                  {formData.provider_type === 'azure' && 'Generate a Personal Access Token in Azure DevOps'}
                  {formData.provider_type === 'jira' && 'Use your API token from Jira'}
                </Text>
              </Box>

              <Box borderTop="1px" borderColor="gray.200" my={4} />

              {/* Organization Details */}
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                <Box>
                  <Text fontWeight="medium" mb={2}>Company Name</Text>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Your organization name"
                  />
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Company Domain</Text>
                  <Input
                    value={formData.company_domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_domain: e.target.value }))}
                    placeholder="company.com"
                  />
                </Box>
              </Grid>

              {/* Advanced Configuration */}
              <Box>
                <Text fontWeight="medium" mb={2}>Advanced Configuration (JSON)</Text>
                <Textarea
                  value={formData.provider_config}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_config: e.target.value }))}
                  placeholder='{"project_id": "123", "branch": "main"}'
                  rows={4}
                  fontFamily="mono"
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Optional: Provider-specific configuration in JSON format
                </Text>
              </Box>

              {/* Connection Test */}
              {connectionStatus && (
                <Box 
                  bg={connectionStatus.connection_status ? 'green.50' : 'red.50'} 
                  border="1px" 
                  borderColor={connectionStatus.connection_status ? 'green.200' : 'red.200'} 
                  p={4} 
                  borderRadius="md"
                >
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold" color={connectionStatus.connection_status ? 'green.800' : 'red.800'}>
                      Connection {connectionStatus.connection_status ? 'Successful' : 'Failed'}
                    </Text>
                    <Text fontSize="sm" color={connectionStatus.connection_status ? 'green.700' : 'red.700'}>
                      {connectionStatus.provider_type} at {connectionStatus.provider_url}
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* Action Buttons */}
              <HStack gap={4}>
                <Button
                  variant="outline"
                  onClick={testConnection}
                  loading={testingConnection}
                  disabled={!formData.provider_url || !formData.access_token}
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={saveConfiguration}
                  loading={loading}
                  disabled={!selectedProject || !formData.provider_url || !formData.access_token}
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </HStack>
          </VStack>
        </Box>

        {/* Token Generation Help */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <HStack gap={3} mb={4}>
            <FiInfo />
            <Heading size="md">How to Generate Access Tokens</Heading>
          </HStack>
          <VStack gap={4} align="stretch">
            {formData.provider_type === 'gitlab' && (
              <VStack align="start" gap={2}>
                <Text fontWeight="medium">GitLab Personal Access Token:</Text>
                <Box pl={4}>
                  <VStack align="start" gap={1} fontSize="sm">
                    <HStack>
                      <FiCheck color="green" />
                      <Text>Go to GitLab → User Settings → Access Tokens</Text>
                    </HStack>
                    <HStack>
                      <FiCheck color="green" />
                      <Text>Create token with <Text as="span" fontFamily="mono" bg="gray.100" px={1} borderRadius="sm">api</Text> scope</Text>
                    </HStack>
                    <HStack>
                      <FiCheck color="green" />
                      <Text>Copy the generated token (you won't see it again)</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            )}

            {formData.provider_type === 'azure' && (
              <VStack align="start" gap={2}>
                <Text fontWeight="medium">Azure DevOps Personal Access Token:</Text>
                <Box pl={4}>
                  <VStack align="start" gap={1} fontSize="sm">
                    <HStack>
                      <FiCheck color="green" />
                      <Text>Go to Azure DevOps → User Settings → Personal Access Tokens</Text>
                    </HStack>
                    <HStack>
                      <FiCheck color="green" />
                      <Text>Create token with <Text as="span" fontFamily="mono" bg="gray.100" px={1} borderRadius="sm">Work Items (read & write)</Text> scope</Text>
                    </HStack>
                    <HStack>
                      <FiCheck color="green" />
                      <Text>Set appropriate expiration date</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ProviderConfig;
