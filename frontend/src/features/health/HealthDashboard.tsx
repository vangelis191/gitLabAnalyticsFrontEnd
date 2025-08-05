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
import type { HealthDashboard as HealthDashboardData } from '../../services/api';

const HealthDashboard: React.FC = () => {
  const api = useApi();
  const [data, setData] = useState<HealthDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch health dashboard data
        const healthData = await api.getHealthDashboard();
        setData(healthData);
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to load health data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [api]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading health data...</Text>
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
        <Text color="blue.700">No health data available.</Text>
      </Box>
    );
  }

  const { sprint_health, epic_health, overall_health } = data;

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'green';
      case 'needs_attention':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Project Health Dashboard</Heading>
          <Text color="gray.600">Comprehensive health indicators and project status</Text>
        </Box>

        {/* Overall Health Score */}
        <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
          <Box mb={4}>
            <Heading size="md">Overall Project Health</Heading>
          </Box>
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">Health Score</Text>
              <Badge
                colorScheme={getHealthColor(overall_health.health_status)}
                variant="subtle"
                fontSize="lg"
                px={3}
                py={1}
              >
                {overall_health.health_score.toFixed(1)}%
              </Badge>
            </HStack>
            
            <Box>
              <Box
                bg={`${getHealthColor(overall_health.health_status)}.100`}
                h={4}
                borderRadius="md"
                position="relative"
                overflow="hidden"
              >
                <Box
                  bg={`${getHealthColor(overall_health.health_status)}.500`}
                  h="100%"
                  width={`${overall_health.health_score}%`}
                  transition="width 0.3s ease"
                />
              </Box>
            </Box>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.500">Total Sprints</Text>
                <Text fontSize="2xl" fontWeight="bold">{overall_health.total_sprints}</Text>
                <Text fontSize="xs" color="green.500">↑ Analyzed</Text>
              </Box>
              
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.500">Excellent Sprints</Text>
                <Text fontSize="2xl" fontWeight="bold">{overall_health.excellent_sprints}</Text>
                <Text fontSize="xs" color="green.500">↑ High performance</Text>
              </Box>
              
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.500">Good Sprints</Text>
                <Text fontSize="2xl" fontWeight="bold">{overall_health.good_sprints}</Text>
                <Text fontSize="xs" color="green.500">↑ On track</Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Sprint Health */}
        {sprint_health.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Sprint Health Analysis</Heading>
            <VStack gap={3} align="stretch">
              {sprint_health.map((sprint) => (
                <Box key={sprint.milestone_id} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" fontSize="lg">{sprint.milestone_title}</Text>
                    <Badge
                      colorScheme={getHealthColor(sprint.health_status)}
                      variant="subtle"
                    >
                      {sprint.health_status}
                    </Badge>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Completion Rate</Text>
                      <Text fontWeight="bold" color={getHealthColor(sprint.health_status) + '.500'}>
                        {sprint.completion_rate_percent.toFixed(1)}%
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color="gray.500">Estimation Accuracy</Text>
                      <Text fontWeight="bold" color={sprint.estimation_accuracy_percent >= 90 ? 'green.500' : 'orange.500'}>
                        {sprint.estimation_accuracy_percent.toFixed(1)}%
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color="gray.500">Progress</Text>
                      <Text fontWeight="bold" color={getHealthColor(sprint.health_status) + '.500'}>
                        {sprint.progress_percentage.toFixed(1)}%
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color="gray.500">Days Remaining</Text>
                      <Text 
                        fontWeight="bold" 
                        color={sprint.days_remaining <= 3 ? 'red.500' : 'inherit'}
                      >
                        {sprint.days_remaining} days
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Epic Health */}
        {epic_health && epic_health.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Epic Health Analysis</Heading>
            <VStack gap={3} align="stretch">
              {epic_health.map((epic: unknown, index: number) => {
                const epicData = epic as { title?: string; successful?: boolean; progress?: number; health_status?: string };
                return (
                  <Box key={index} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="semibold" fontSize="lg">{epicData.title || `Epic ${index + 1}`}</Text>
                      <Badge
                        colorScheme={epicData.successful ? 'green' : 'orange'}
                        variant="subtle"
                      >
                        {epicData.successful ? 'On Track' : 'Needs Attention'}
                      </Badge>
                    </HStack>
                    
                    <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Progress</Text>
                        <Text fontWeight="bold" color={epicData.successful ? 'green.500' : 'orange.500'}>
                          {epicData.progress || 50}%
                        </Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color="gray.500">Health Status</Text>
                        <Badge
                          colorScheme={getHealthColor(epicData.health_status || 'needs_attention')}
                          variant="subtle"
                        >
                          {epicData.health_status || 'Needs Attention'}
                        </Badge>
                      </Box>
                    </SimpleGrid>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        {/* Health Metrics Summary */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Average Completion Rate</Text>
            <Text fontSize="2xl" fontWeight="bold">
              {sprint_health.length > 0 
                ? (sprint_health.reduce((sum, sprint) => sum + sprint.completion_rate_percent, 0) / sprint_health.length).toFixed(1)
                : 0
              }%
            </Text>
            <Text fontSize="xs" color="green.500">↑ Across all sprints</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Average Estimation Accuracy</Text>
            <Text fontSize="2xl" fontWeight="bold">
              {sprint_health.length > 0 
                ? (sprint_health.reduce((sum, sprint) => sum + sprint.estimation_accuracy_percent, 0) / sprint_health.length).toFixed(1)
                : 0
              }%
            </Text>
            <Text fontSize="xs" color="green.500">↑ Time estimates</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Healthy Sprints</Text>
            <Text fontSize="2xl" fontWeight="bold">
              {sprint_health.filter(sprint => 
                sprint.health_status === 'excellent' || sprint.health_status === 'good'
              ).length}
            </Text>
            <Text fontSize="xs" color="green.500">↑ Out of {sprint_health.length}</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Issues at Risk</Text>
            <Text fontSize="2xl" fontWeight="bold">
              {sprint_health.filter(sprint => sprint.days_remaining <= 3).length}
            </Text>
            <Text fontSize="xs" color="orange.500">↓ Sprints ending soon</Text>
          </Box>
        </SimpleGrid>

        {/* Health Trends Chart Placeholder */}
        <Box>
          <Heading size="md" mb={4}>Health Trends</Heading>
          <Box
            bg="gray.50"
            p={8}
            borderRadius="lg"
            textAlign="center"
            border="2px dashed"
            borderColor="gray.200"
          >
            <Text color="gray.500">Health trends chart will be displayed here</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Chart will show health score trends over time and identify patterns
            </Text>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default HealthDashboard; 