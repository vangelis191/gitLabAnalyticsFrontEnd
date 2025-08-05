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
import GitLabAnalyticsAPI, { type TeamDashboard as TeamDashboardData, type DeveloperSummary } from '../../services/api';
import { useProject } from '../../contexts/ProjectContext';

const TeamDashboard: React.FC = () => {
  const { selectedProject } = useProject();
  const [data, setData] = useState<TeamDashboardData | null>(null);
  const [developerSummary, setDeveloperSummary] = useState<DeveloperSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team dashboard data and developer summary
        const [teamData, summaryData] = await Promise.all([
          GitLabAnalyticsAPI.getTeamDashboard(selectedProject?.id),
          GitLabAnalyticsAPI.getDeveloperSummary(selectedProject?.id)
        ]);
        
        setData(teamData);
        setDeveloperSummary(summaryData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load team data';
        console.error('Error fetching team data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProject) {
      fetchTeamData();
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <Box p={6} bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view team data</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading team data...</Text>
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
        <Text color="blue.700">No team data available.</Text>
      </Box>
    );
  }

  const { team_capacity, lead_time_summary, throughput_summary } = data;

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Team Dashboard</Heading>
          <Text color="gray.600">Team capacity, performance, and productivity metrics</Text>
        </Box>

        {/* Lead Time Summary */}
        <Box>
          <Heading size="md" mb={4}>Lead Time Analysis</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Average Lead Time</Text>
              <Text fontSize="2xl" fontWeight="bold">{lead_time_summary.average_lead_time_days.toFixed(1)} days</Text>
              <Text fontSize="xs" color="orange.500">↓ From creation to completion</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Issues Analyzed</Text>
              <Text fontSize="2xl" fontWeight="bold">{lead_time_summary.total_issues_analyzed}</Text>
              <Text fontSize="xs" color="green.500">↑ Total issues in analysis</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Throughput Summary */}
        <Box>
          <Heading size="md" mb={4}>Throughput Analysis</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Total Issues Completed</Text>
              <Text fontSize="2xl" fontWeight="bold">{throughput_summary.total_issues_completed}</Text>
              <Text fontSize="xs" color="green.500">↑ In analysis period</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Daily Throughput</Text>
              <Text fontSize="2xl" fontWeight="bold">{throughput_summary.average_daily_throughput.toFixed(2)}</Text>
              <Text fontSize="xs" color="green.500">↑ Issues per day</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Weekly Throughput</Text>
              <Text fontSize="2xl" fontWeight="bold">{throughput_summary.average_weekly_throughput.toFixed(1)}</Text>
              <Text fontSize="xs" color="green.500">↑ Issues per week</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Team Capacity List */}
        {team_capacity.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Team Capacity Analysis</Heading>
            <VStack gap={3} align="stretch">
              {team_capacity.map((member) => (
                <Box key={member.team_member} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" fontSize="lg">{member.team_member}</Text>
                    <Badge
                      colorScheme={member.estimation_accuracy_percent >= 90 ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {member.estimation_accuracy_percent.toFixed(1)}% Accuracy
                    </Badge>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Total Issues</Text>
                      <Text fontWeight="bold">{member.total_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Closed Issues</Text>
                      <Text fontWeight="bold">{member.closed_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Velocity</Text>
                      <Text fontWeight="bold">{member.velocity_hours?.toFixed(1) || '0.0'}h</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Completion Rate</Text>
                      <Text fontWeight="bold" color={(member.completion_rate || 0) >= 80 ? 'green.500' : 'orange.500'}>
                        {member.completion_rate?.toFixed(1) || '0.0'}%
                      </Text>
                    </Box>
                  </SimpleGrid>
                  
                  <HStack gap={4} mt={2}>
                    <Text fontSize="sm" color="gray.600">
                      Estimated: {member.total_estimated_hours?.toFixed(1) || '0.0'}h
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Spent: {member.total_spent_hours?.toFixed(1) || '0.0'}h
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Developer Summary */}
        {developerSummary.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Developer Performance Summary</Heading>
            <VStack gap={3} align="stretch">
              {developerSummary.map((dev) => (
                <Box key={dev.developer} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" fontSize="lg">{dev.developer}</Text>
                    <Badge
                      colorScheme={dev.successful ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {dev.successful ? 'On Track' : 'Needs Attention'}
                    </Badge>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Total Issues</Text>
                      <Text fontWeight="bold">{dev.total_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Closed Issues</Text>
                      <Text fontWeight="bold">{dev.closed_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Progress</Text>
                      <Text fontWeight="bold" color={(dev.progress_percent || 0) >= 80 ? 'green.500' : 'orange.500'}>
                        {dev.progress_percent?.toFixed(1) || '0.0'}%
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Team Performance Charts Placeholder */}
        <Box>
          <Heading size="md" mb={4}>Team Performance Trends</Heading>
          <Box
            bg="gray.50"
            p={8}
            borderRadius="lg"
            textAlign="center"
            border="2px dashed"
            borderColor="gray.200"
          >
            <Text color="gray.500">Team performance charts will be displayed here</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Charts will show velocity trends, capacity utilization, and productivity metrics
            </Text>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default TeamDashboard; 