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
import GitLabAnalyticsAPI, { type SprintDashboard as SprintDashboardData } from '../../services/api';
import { useProject } from '../../hooks/useProject';

const SprintDashboard: React.FC = () => {
  const { selectedProject } = useProject();
  const [data, setData] = useState<SprintDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSprintData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sprintData = await GitLabAnalyticsAPI.getSprintDashboard(selectedProject?.id);
        setData(sprintData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load sprint data';
        console.error('Error fetching sprint data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProject) {
      fetchSprintData();
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <Box p={6} bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view sprint data</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading sprint data...</Text>
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

  if (!data) {
    return (
      <Box p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
        <Text color="blue.800" fontWeight="semibold">No Data</Text>
        <Text color="blue.700">No sprint data available.</Text>
      </Box>
    );
  }

  const { current_sprint, upcoming_sprints, recent_completed_sprints, velocity_summary, defect_summary } = data;

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Sprint Dashboard</Heading>
          <Text color="gray.600">Sprint-focused analytics and performance metrics</Text>
        </Box>

        {/* Current Sprint */}
        {current_sprint && (
          <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
            <Box mb={4}>
              <Heading size="md">Current Sprint: {current_sprint.title}</Heading>
            </Box>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text>
                  <strong>Duration:</strong> {new Date(current_sprint.start_date).toLocaleDateString()} - {new Date(current_sprint.due_date).toLocaleDateString()}
                </Text>
                <Badge colorScheme="blue" variant="subtle">
                  Active
                </Badge>
              </HStack>
              
              {/* sprintHealth.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">Health Status</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      <Badge
                        colorScheme={sprintHealth[0].health_status === 'good' ? 'green' : 'orange'}
                        variant="subtle"
                      >
                        {sprintHealth[0].health_status}
                      </Badge>
                    </Text>
                  </Box>
                  
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">Completion Rate</Text>
                    <Text fontSize="lg" fontWeight="bold">{sprintHealth[0]?.completion_rate_percent?.toFixed(1) || '0.0'}%</Text>
                    <Text fontSize="xs" color="green.500">↑ Progress</Text>
                  </Box>
                  
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.500">Days Remaining</Text>
                    <Text fontSize="lg" fontWeight="bold">{sprintHealth[0].days_remaining}</Text>
                    <Text fontSize="xs" color="orange.500">↓ Out of {sprintHealth[0].total_days}</Text>
                  </Box>
                </SimpleGrid>
              ) */}
            </VStack>
          </Box>
        )}

        {/* Velocity Summary */}
        <Box>
          <Heading size="md" mb={4}>Velocity Summary</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Average Velocity</Text>
              <Text fontSize="2xl" fontWeight="bold">{velocity_summary.average_velocity_hours?.toFixed(1) || '0.0'}h</Text>
              <Text fontSize="xs" color="green.500">↑ Per sprint</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Sprints Analyzed</Text>
              <Text fontSize="2xl" fontWeight="bold">{velocity_summary.total_sprints_analyzed}</Text>
              <Text fontSize="xs" color="green.500">↑ Historical data</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Defect Summary */}
        <Box>
          <Heading size="md" mb={4}>Defect Analysis</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Defect Rate</Text>
              <Text fontSize="2xl" fontWeight="bold">{defect_summary.defect_rate_percent?.toFixed(1) || '0.0'}%</Text>
              <Text fontSize="xs" color="orange.500">↓ Of total issues</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Total Issues</Text>
              <Text fontSize="2xl" fontWeight="bold">{defect_summary.total_issues}</Text>
              <Text fontSize="xs" color="green.500">↑ Including defects</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Upcoming Sprints */}
        {upcoming_sprints && upcoming_sprints.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Upcoming Sprints</Heading>
            <VStack gap={3} align="stretch">
              {upcoming_sprints.map((sprint: unknown, index: number) => {
                const sprintData = sprint as { title?: string; start_date?: string; due_date?: string };
                return (
                  <Box key={index} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="semibold">{sprintData.title || `Sprint ${index + 1}`}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {sprintData.start_date ? new Date(sprintData.start_date).toLocaleDateString() : 'TBD'} - {sprintData.due_date ? new Date(sprintData.due_date).toLocaleDateString() : 'TBD'}
                        </Text>
                      </Box>
                      <Badge colorScheme="blue" variant="subtle">
                        Planned
                      </Badge>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        {/* Recent Completed Sprints */}
        {recent_completed_sprints && recent_completed_sprints.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Recent Completed Sprints</Heading>
            <VStack gap={3} align="stretch">
              {recent_completed_sprints.map((sprint: unknown, index: number) => {
                const sprintData = sprint as { title?: string; start_date?: string; due_date?: string };
                return (
                  <Box key={index} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="semibold">{sprintData.title || `Sprint ${index + 1}`}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {sprintData.start_date ? new Date(sprintData.start_date).toLocaleDateString() : 'N/A'} - {sprintData.due_date ? new Date(sprintData.due_date).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Box>
                      <Badge colorScheme="green" variant="subtle">
                        Completed
                      </Badge>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        {/* Sprint Health Details */}
        {/* sprintHealth.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Sprint Health Details</Heading>
            <VStack gap={3} align="stretch">
              <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Total Issues</Text>
                  <HStack gap={2}>
                    <Text fontWeight="bold">{sprintHealth[0].total_issues}</Text>
                    <Badge colorScheme="blue" variant="subtle">Active</Badge>
                  </HStack>
                </HStack>
              </Box>
              
              <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Closed Issues</Text>
                  <HStack gap={2}>
                    <Text fontWeight="bold">{sprintHealth[0].closed_issues}</Text>
                    <Badge colorScheme="green" variant="subtle">Completed</Badge>
                  </HStack>
                </HStack>
              </Box>
              
              <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Estimated Hours</Text>
                  <HStack gap={2}>
                    <Text fontWeight="bold">{sprintHealth[0]?.total_estimated_hours?.toFixed(1) || '0.0'}h</Text>
                    <Badge colorScheme="blue" variant="subtle">Planned</Badge>
                  </HStack>
                </HStack>
              </Box>
              
              <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Spent Hours</Text>
                  <HStack gap={2}>
                    <Text fontWeight="bold">{sprintHealth[0]?.total_spent_hours?.toFixed(1) || '0.0'}h</Text>
                    <Badge colorScheme="orange" variant="subtle">Actual</Badge>
                  </HStack>
                </HStack>
              </Box>
              
              <Box p={4} bg="white" borderRadius="lg" boxShadow="sm">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Estimation Accuracy</Text>
                  <HStack gap={2}>
                    <Text fontWeight="bold">{sprintHealth[0]?.estimation_accuracy_percent?.toFixed(1) || '0.0'}%</Text>
                                          <Badge
                        colorScheme={(sprintHealth[0]?.estimation_accuracy_percent || 0) >= 90 ? 'green' : 'orange'}
                        variant="subtle"
                      >
                        {(sprintHealth[0]?.estimation_accuracy_percent || 0) >= 90 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                  </HStack>
                </HStack>
              </Box>
            </VStack>
          </Box>
        ) */}

        {/* Sprint Charts Placeholder */}
        <Box>
          <Heading size="md" mb={4}>Sprint Analytics Charts</Heading>
          <Box
            bg="gray.50"
            p={8}
            borderRadius="lg"
            textAlign="center"
            border="2px dashed"
            borderColor="gray.200"
          >
            <Text color="gray.500">Sprint analytics charts will be displayed here</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Charts will show burndown, velocity trends, and sprint health indicators
            </Text>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default SprintDashboard; 