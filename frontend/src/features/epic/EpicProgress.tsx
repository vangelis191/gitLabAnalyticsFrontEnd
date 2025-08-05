import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Spinner,
} from '@chakra-ui/react';

import useApi from '../../hooks/useApi';
import type { EpicSuccess, EpicStatus, Epic } from '../../services/api';

const EpicProgress: React.FC = () => {
  const api = useApi();
  const [epicSuccess, setEpicSuccess] = useState<EpicSuccess[]>([]);
  const [epicStatus, setEpicStatus] = useState<EpicStatus | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpicData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch epic data
        const [successData, statusData, epicsData] = await Promise.all([
          api.getEpicSuccess(),
          api.getEpicStatus(),
          api.getEpics()
        ]);
        
        setEpicSuccess(successData);
        setEpicStatus(statusData);
        setEpics(epicsData);
      } catch (err) {
        console.error('Error fetching epic data:', err);
        setError('Failed to load epic data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEpicData();
  }, [api]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading epic data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
        <Text color="red.800" fontWeight="semibold">Error!</Text>
        <Text color="red.700">{error}</Text>
      </Box>
    );
  }

  const successfulEpics = epicSuccess.filter(epic => epic.successful).length;
  const totalEpics = epicSuccess.length;
  const successRate = totalEpics > 0 ? (successfulEpics / totalEpics) * 100 : 0;

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Epic Progress Analysis</Heading>
          <Text color="gray.600">Track progress of epics and major initiatives</Text>
        </Box>

        {/* Epic Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Total Epics</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalEpics}</Text>
            <Text fontSize="xs" color="green.500">↑ Active epics</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Successful Epics</Text>
            <Text fontSize="2xl" fontWeight="bold">{successfulEpics}</Text>
            <Text fontSize="xs" color="green.500">↑ Completed successfully</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Success Rate</Text>
            <Text fontSize="2xl" fontWeight="bold">{successRate.toFixed(1)}%</Text>
            <Text fontSize="xs" color={successRate >= 80 ? "green.500" : "orange.500"}>
              {successRate >= 80 ? "↑" : "↓"} Overall success
            </Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">In Progress</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalEpics - successfulEpics}</Text>
            <Text fontSize="xs" color="orange.500">↓ Still active</Text>
          </Box>
        </SimpleGrid>

        {/* Epic Success List */}
        {epicSuccess.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Epic Success Status</Heading>
            <VStack gap={3} align="stretch">
              {epicSuccess.map((epic) => (
                <Box key={epic.epic_id} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="semibold">Epic {epic.epic_id}: {epic.epic_title}</Text>
                    </Box>
                    <Badge
                      colorScheme={epic.successful ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {epic.successful ? 'Successful' : 'In Progress'}
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Epic Status Details */}
        {epicStatus && (
          <Box>
            <Heading size="md" mb={4}>Epic Status Details</Heading>
            <Box p={4} border="1px" borderColor="gray.200" borderRadius="lg" bg="white">
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Epic: {epicStatus.epic_title}</Text>
                  <Badge
                    colorScheme={epicStatus.successful ? 'green' : 'orange'}
                    variant="subtle"
                  >
                    {epicStatus.successful ? 'Successful' : 'In Progress'}
                  </Badge>
                </HStack>
                
                <HStack gap={4}>
                  <Text fontSize="sm" color="gray.600">
                    Start: {new Date(epicStatus.start_date).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Due: {new Date(epicStatus.due_date).toLocaleDateString()}
                  </Text>
                </HStack>

                {epicStatus.milestones.length > 0 && (
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Milestone Breakdown:</Text>
                    <VStack gap={2} align="stretch">
                      {epicStatus.milestones.map((milestone) => (
                        <Box key={milestone.milestone_id} p={3} bg="gray.50" borderRadius="md">
                          <HStack justify="space-between">
                            <Text fontWeight="medium">{milestone.title}</Text>
                            <Badge
                              colorScheme={milestone.successful ? 'green' : 'orange'}
                              variant="subtle"
                              size="sm"
                            >
                              {milestone.successful ? 'Completed' : 'In Progress'}
                            </Badge>
                          </HStack>
                          <HStack gap={4} mt={1}>
                            <Text fontSize="sm">Total: {milestone.total_issues}</Text>
                            <Text fontSize="sm">Closed: {milestone.closed_issues}</Text>
                            <Text fontSize="sm">Progress: {milestone.progress_percent.toFixed(1)}%</Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          </Box>
        )}

        {/* Epics List */}
        {epics.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>All Epics</Heading>
            <VStack gap={3} align="stretch">
              {epics.map((epic) => (
                <Box key={epic.id} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="semibold">ID {epic.id}: {epic.title}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {new Date(epic.start_date).toLocaleDateString()} - {new Date(epic.due_date).toLocaleDateString()}
                      </Text>
                    </Box>
                    <Text fontSize="sm" color="gray.500">Project {epic.project_id}</Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Progress Chart Placeholder */}
        <Box>
          <Heading size="md" mb={4}>Epic Progress Chart</Heading>
          <Box
            bg="gray.50"
            p={8}
            borderRadius="lg"
            textAlign="center"
            border="2px dashed"
            borderColor="gray.200"
          >
            <Text color="gray.500">Epic progress chart visualization will be displayed here</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Chart data will be rendered using the epic progress endpoint
            </Text>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default EpicProgress;
