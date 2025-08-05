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
import type { VelocityStats, GitLabVelocity } from '../../services/api';

const VelocityChart: React.FC = () => {
  const api = useApi();
  const [velocityStats, setVelocityStats] = useState<VelocityStats | null>(null);
  const [gitlabVelocity, setGitLabVelocity] = useState<GitLabVelocity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVelocityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both velocity stats and GitLab velocity data
        const [statsData, gitlabData] = await Promise.all([
          api.getVelocityStats(40), // 40 hours backlog
          api.getGitLabVelocity()
        ]);
        
        setVelocityStats(statsData);
        setGitLabVelocity(gitlabData);
      } catch (err) {
        console.error('Error fetching velocity data:', err);
        setError('Failed to load velocity data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVelocityData();
  }, [api]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading velocity data...</Text>
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

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Velocity Analysis</Heading>
          <Text color="gray.600">Time-based velocity statistics using GitLab time estimates</Text>
        </Box>

        {/* Velocity Summary Stats */}
        {velocityStats && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Average Velocity</Text>
              <Text fontSize="2xl" fontWeight="bold">{velocityStats.average_velocity_hours.toFixed(1)}h</Text>
              <Text fontSize="xs" color="green.500">↑ Per sprint</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Total Issues Closed</Text>
              <Text fontSize="2xl" fontWeight="bold">{velocityStats.total_issues_closed}</Text>
              <Text fontSize="xs" color="green.500">↑ Across all sprints</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Backlog Remaining</Text>
              <Text fontSize="2xl" fontWeight="bold">{velocityStats.backlog_remaining_hours}h</Text>
              <Text fontSize="xs" color="gray.600">Estimated hours remaining</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Sprints to Finish</Text>
              <Text fontSize="2xl" fontWeight="bold">{velocityStats.estimated_sprints_to_finish_backlog}</Text>
              <Text fontSize="xs" color="gray.600">Based on current velocity</Text>
            </Box>
          </SimpleGrid>
        )}

        {/* Sprint Velocity List */}
        {velocityStats && velocityStats.sprints.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Sprint Velocity Breakdown</Heading>
            <VStack gap={3} align="stretch">
              {velocityStats.sprints.map((sprint) => (
                <Box key={sprint.milestone_id} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" fontSize="lg">{sprint.title}</Text>
                    <Badge
                      colorScheme={sprint.closed_issues === sprint.total_issues ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {sprint.closed_issues === sprint.total_issues ? 'Completed' : 'In Progress'}
                    </Badge>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Total Issues</Text>
                      <Text fontWeight="bold">{sprint.total_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Closed Issues</Text>
                      <Text fontWeight="bold">{sprint.closed_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Velocity (Hours)</Text>
                      <Text fontWeight="bold">{sprint.velocity_hours.toFixed(1)}h</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Avg Hours/Issue</Text>
                      <Text fontWeight="bold">{sprint.avg_hours_per_issue.toFixed(1)}h</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* GitLab Time-Based Velocity */}
        {gitlabVelocity.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>GitLab Time-Based Velocity</Heading>
            <VStack gap={3} align="stretch">
              {gitlabVelocity.map((sprint) => (
                <Box key={sprint.milestone_id} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" fontSize="lg">{sprint.milestone_title}</Text>
                    <Badge
                      colorScheme={sprint.estimation_accuracy_percent >= 90 ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {sprint.estimation_accuracy_percent.toFixed(1)}% Accuracy
                    </Badge>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Estimated Hours</Text>
                      <Text fontWeight="bold">{sprint.total_estimated_hours.toFixed(1)}h</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Spent Hours</Text>
                      <Text fontWeight="bold">{sprint.total_spent_hours.toFixed(1)}h</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Estimation Accuracy</Text>
                      <Text fontWeight="bold" color={sprint.estimation_accuracy_percent >= 90 ? 'green.500' : 'orange.500'}>
                        {sprint.estimation_accuracy_percent.toFixed(1)}%
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Avg Hours/Issue</Text>
                      <Text fontWeight="bold">{sprint.avg_hours_per_issue.toFixed(1)}h</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Chart Placeholder */}
        <Box>
          <Heading size="md" mb={4}>Velocity Chart</Heading>
          <Box
            bg="gray.50"
            p={8}
            borderRadius="lg"
            textAlign="center"
            border="2px dashed"
            borderColor="gray.200"
          >
            <Text color="gray.500">Velocity chart visualization will be displayed here</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Chart data will be rendered using the velocity chart endpoint
            </Text>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default VelocityChart;
