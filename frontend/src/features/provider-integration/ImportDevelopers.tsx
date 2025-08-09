import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Code,
} from '@chakra-ui/react';
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  DialogBackdrop,
} from '@chakra-ui/react';
import {
  StatRoot,
  StatLabel,
  StatValueText,
  StatGroup,
} from '@chakra-ui/react';
import { FiDownload, FiRefreshCw, FiEye, FiCheck, FiX } from 'react-icons/fi';
import GitLabAnalyticsAPI from '../../services/api';
import type { 
  ImportDevelopersResponse, 
  PreviewImportResponse, 
  ImportStatusResponse 
} from '../../services/api';
import { useProject } from '../../hooks/useProject';

interface ErrorWithResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const ImportDevelopers: React.FC = () => {
  const [importStatus, setImportStatus] = useState<ImportStatusResponse | null>(null);
  const [previewData, setPreviewData] = useState<PreviewImportResponse | null>(null);
  const [lastImportResult, setLastImportResult] = useState<ImportDevelopersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedProject } = useProject();

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
    if (selectedProject) {
      loadImportStatus();
    }
  }, [selectedProject, loadImportStatus]);

  const previewImport = async () => {
    if (!selectedProject || !importStatus?.provider_configured) return;

    setPreviewing(true);
    try {
      const preview = await GitLabAnalyticsAPI.previewImport(selectedProject.id, {
        provider_type: importStatus.provider_type,
        provider_url: importStatus.provider_url,
        access_token: '', // Will use stored token
      });
      setPreviewData(preview);
      setIsModalOpen(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'response' in error) ? 
          ((error as ErrorWithResponse).response?.data?.error || 'Failed to preview import') : 
          'Failed to preview import';
      console.error('Preview failed:', errorMessage);
    } finally {
      setPreviewing(false);
    }
  };

  const importDevelopers = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const result = await GitLabAnalyticsAPI.importDevelopersFromProvider(selectedProject.id);
      setLastImportResult(result);
      await loadImportStatus();

      console.log('Import completed:', `Successfully processed ${result.total_processed} developers`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'response' in error) ? 
          ((error as ErrorWithResponse).response?.data?.error || 'Failed to import developers') : 
          'Failed to import developers';
      console.error('Import failed:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const syncDevelopers = async () => {
    if (!selectedProject) return;

    setSyncing(true);
    try {
      const result = await GitLabAnalyticsAPI.syncDevelopers(selectedProject.id);
      setLastImportResult(result);
      await loadImportStatus();

      console.log('Sync completed:', `Synchronized ${result.updated_count} developers`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'response' in error) ? 
          ((error as ErrorWithResponse).response?.data?.error || 'Failed to sync developers') : 
          'Failed to sync developers';
      console.error('Sync failed:', errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadgeColor = (configured: boolean, connected: boolean) => {
    if (configured && connected) return 'green';
    if (configured && !connected) return 'orange';
    return 'red';
  };

  const getStatusText = (configured: boolean, connected: boolean) => {
    if (configured && connected) return 'Ready';
    if (configured && !connected) return 'Connection Issue';
    return 'Not Configured';
  };

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HStack gap={3}>
          <FiDownload size={24} />
          <Heading size="lg">Import Developers</Heading>
        </HStack>

        {!selectedProject && (
          <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
            <Text color="yellow.600">Please select a project to import developers.</Text>
          </Box>
        )}

        {/* Current Status */}
        {importStatus && (
          <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <Heading size="md" mb={4}>Import Status</Heading>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="medium">Provider Configuration</Text>
                    <HStack>
                      <Badge 
                        colorScheme={getStatusBadgeColor(importStatus.provider_configured, importStatus.provider_connection_status)}
                      >
                        {getStatusText(importStatus.provider_configured, importStatus.provider_connection_status)}
                      </Badge>
                      {importStatus.provider_type && (
                        <Badge variant="outline">{importStatus.provider_type}</Badge>
                      )}
                    </HStack>
                    {importStatus.provider_url && (
                      <Text fontSize="sm" color="gray.600">{importStatus.provider_url}</Text>
                    )}
                  </VStack>

                  <StatGroup>
                    <StatRoot textAlign="center">
                      <StatLabel>Total Developers</StatLabel>
                      <StatValueText>{importStatus.total_developers}</StatValueText>
                    </StatRoot>
                    <StatRoot textAlign="center">
                      <StatLabel>Active</StatLabel>
                      <StatValueText color="green.500">{importStatus.active_developers}</StatValueText>
                    </StatRoot>
                  </StatGroup>
                </HStack>

                {!importStatus.provider_configured && (
                  <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold" color="yellow.600">Provider not configured</Text>
                      <Text fontSize="sm" color="yellow.600">
                        Configure your provider settings first in the Provider Configuration tab.
                      </Text>
                    </VStack>
                  </Box>
                )}

                {importStatus.provider_configured && !importStatus.provider_connection_status && (
                  <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold" color="red.600">Connection failed</Text>
                      <Text fontSize="sm" color="red.600">
                        Check your provider configuration and credentials.
                      </Text>
                    </VStack>
                  </Box>
                )}
              </VStack>
          </Box>
        )}

        {/* Import Actions */}
        <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
          <Heading size="md" mb={4}>Import Operations</Heading>
            <VStack gap={4} align="stretch">
              <HStack gap={4} wrap="wrap">
                <Button
                  variant="outline"
                  onClick={previewImport}
                  loading={previewing}
                  disabled={!importStatus?.provider_configured || !importStatus?.provider_connection_status}
                >
                  <FiEye style={{ marginRight: '8px' }} />
                  Preview Import
                </Button>

                <Button
                  colorScheme="blue"
                  onClick={importDevelopers}
                  loading={loading}
                  disabled={!importStatus?.provider_configured || !importStatus?.provider_connection_status}
                >
                  <FiDownload style={{ marginRight: '8px' }} />
                  Import Developers
                </Button>

                <Button
                  colorScheme="green"
                  variant="outline"
                  onClick={syncDevelopers}
                  loading={syncing}
                  disabled={!importStatus?.provider_configured || !importStatus?.provider_connection_status || importStatus.total_developers === 0}
                >
                  <FiRefreshCw style={{ marginRight: '8px' }} />
                  Sync Existing
                </Button>
              </HStack>

              <VStack align="start" gap={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>Preview Import:</strong> Shows what developers would be imported without making changes
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Import Developers:</strong> Imports new developers from your provider
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Sync Existing:</strong> Updates existing developers with fresh data from provider
                </Text>
              </VStack>
            </VStack>
        </Box>

        {/* Last Import Results */}
        {lastImportResult && (
          <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <Heading size="md" mb={4}>
              {lastImportResult.sync_operation ? 'Last Sync Results' : 'Last Import Results'}
            </Heading>
              <VStack gap={4} align="stretch">
                <StatGroup>
                  <StatRoot>
                    <StatLabel>Total Processed</StatLabel>
                    <StatValueText>{lastImportResult.total_processed}</StatValueText>
                  </StatRoot>
                  <StatRoot>
                    <StatLabel>Imported</StatLabel>
                    <StatValueText color="green.500">{lastImportResult.imported_count}</StatValueText>
                  </StatRoot>
                  <StatRoot>
                    <StatLabel>Updated</StatLabel>
                    <StatValueText color="blue.500">{lastImportResult.updated_count}</StatValueText>
                  </StatRoot>
                  <StatRoot>
                    <StatLabel>Skipped</StatLabel>
                    <StatValueText color="gray.500">{lastImportResult.skipped_count}</StatValueText>
                  </StatRoot>
                </StatGroup>

                {lastImportResult.errors.length > 0 && (
                  <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold" color="yellow.600">
                        {lastImportResult.errors.length} errors occurred during import
                      </Text>
                      <VStack align="start" gap={1} fontSize="sm">
                        {lastImportResult.errors.slice(0, 3).map((error, index) => (
                          <Text key={index} color="orange.600">• {error}</Text>
                        ))}
                        {lastImportResult.errors.length > 3 && (
                          <Text color="gray.500">... and {lastImportResult.errors.length - 3} more</Text>
                        )}
                      </VStack>
                    </VStack>
                  </Box>
                )}

                <HStack>
                  <Badge colorScheme="green">{lastImportResult.provider_type}</Badge>
                  <Text fontSize="sm" color="gray.600">
                    Project ID: {lastImportResult.project_id}
                  </Text>
                </HStack>
              </VStack>
          </Box>
        )}

        {/* Progress Indicator */}
        {(loading || syncing || previewing) && (
          <Box p={6} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap={3}>
              <Box w="full" h="4" bg="blue.100" borderRadius="md">
                <Box w="full" h="full" bg="blue.500" borderRadius="md" className="animate-pulse" />
              </Box>
              <Text>
                {loading && 'Importing developers from provider...'}
                {syncing && 'Synchronizing developer data...'}
                {previewing && 'Loading preview data...'}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Preview Modal */}
        <DialogRoot open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)} size="xl">
          <DialogBackdrop />
          <DialogContent>
            <DialogHeader>Import Preview</DialogHeader>
            <DialogCloseTrigger />
            <DialogBody pb={6}>
              {previewData && (
                <VStack gap={6} align="stretch">
                  <StatGroup>
                    <StatRoot>
                      <StatLabel>Total Users Found</StatLabel>
                      <StatValueText>{previewData.total_users_found}</StatValueText>
                    </StatRoot>
                    <StatRoot>
                      <StatLabel>Active Users</StatLabel>
                      <StatValueText color="green.500">{previewData.active_users_count}</StatValueText>
                    </StatRoot>
                    <StatRoot>
                      <StatLabel>Inactive Users</StatLabel>
                      <StatValueText color="gray.500">{previewData.inactive_users_count}</StatValueText>
                    </StatRoot>
                    <StatRoot>
                      <StatLabel>Will Import</StatLabel>
                      <StatValueText color="blue.500">
                        {previewData.preview_users.filter(u => u.will_be_imported).length}
                      </StatValueText>
                    </StatRoot>
                  </StatGroup>

                  <Box w="full" h="1px" bg="gray.200" />

                  <Box overflowX="auto" maxH="400px" overflowY="auto">
                    <TableRoot variant="outline" size="sm">
                      <TableHeader position="sticky" top={0} bg="white">
                        <TableRow>
                          <TableColumnHeader>Status</TableColumnHeader>
                          <TableColumnHeader>Username</TableColumnHeader>
                          <TableColumnHeader>Name</TableColumnHeader>
                          <TableColumnHeader>Email</TableColumnHeader>
                          <TableColumnHeader>Active</TableColumnHeader>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.preview_users.map((user, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {user.will_be_imported ? (
                                <Badge colorScheme="green">
                                  <FiCheck style={{ marginRight: '4px' }} />
                                  Will Import
                                </Badge>
                              ) : (
                                <Badge colorScheme="gray">
                                  <FiX style={{ marginRight: '4px' }} />
                                  Skip
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Code fontSize="sm">{user.username}</Code>
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge colorScheme={user.is_active ? 'green' : 'red'} size="sm">
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableRoot>
                  </Box>

                  <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold" color="blue.600">Preview Information</Text>
                      <Text fontSize="sm" color="blue.600">
                        Only active users will be imported. Inactive users are shown for reference but will be skipped.
                        Default settings will be applied to imported developers (8h/day, 5 days/week, 85% availability).
                      </Text>
                    </VStack>
                  </Box>

                  <HStack justify="end">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Close Preview
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      onClick={() => {
                        setIsModalOpen(false);
                        importDevelopers();
                      }}
                      disabled={previewData.preview_users.filter(u => u.will_be_imported).length === 0}
                    >
                      Proceed with Import
                    </Button>
                  </HStack>
                </VStack>
              )}
            </DialogBody>
          </DialogContent>
        </DialogRoot>
      </VStack>
    </Box>
  );
};

export default ImportDevelopers;
