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
import type { DashboardOverview } from '../../services/api';

const Dashboard: React.FC = () => {
  const api = useApi();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await api.getDashboardOverview();
        setData(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [api]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading dashboard data...</Text>
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
        <Text color="blue.700">No dashboard data available.</Text>
      </Box>
    );
  }

  const { summary, health_indicators } = data;

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Project Overview Dashboard</Heading>
          <Text color="gray.600">Comprehensive analytics and insights for your GitLab projects</Text>
        </Box>

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Total Projects</Text>
            <Text fontSize="2xl" fontWeight="bold">{summary.total_projects}</Text>
            <Text fontSize="xs" color="green.500">↑ 23.36%</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Total Milestones</Text>
            <Text fontSize="2xl" fontWeight="bold">{summary.total_milestones}</Text>
            <Text fontSize="xs" color="green.500">↑ 12.5%</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Total Epics</Text>
            <Text fontSize="2xl" fontWeight="bold">{summary.total_epics}</Text>
            <Text fontSize="xs" color="orange.500">↓ 8.2%</Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Total Issues</Text>
            <Text fontSize="2xl" fontWeight="bold">{summary.total_issues}</Text>
            <Text fontSize="xs" color="green.500">↑ 15.3%</Text>
          </Box>
        </SimpleGrid>

        {/* Progress Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Completion Rate</Text>
            <Text fontSize="2xl" fontWeight="bold">{summary.overall_completion_rate.toFixed(1)}%</Text>
            <Text fontSize="xs" color="gray.600">
              {summary.total_closed_issues} of {summary.total_issues} issues completed
            </Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Estimation Accuracy</Text>
            <Text fontSize="2xl" fontWeight="bold">{summary.estimation_accuracy.toFixed(1)}%</Text>
            <Text fontSize="xs" color="gray.600">
              {summary.total_spent_hours}h spent vs {summary.total_estimated_hours}h estimated
            </Text>
          </Box>

          <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
            <Text fontSize="sm" color="gray.500">Total Hours</Text>
            <Text fontSize="2xl" fontWeight="bold">{summary.total_spent_hours}</Text>
            <Text fontSize="xs" color="gray.600">
              {summary.total_estimated_hours}h estimated
            </Text>
          </Box>
        </SimpleGrid>

        {/* Health Indicators */}
        <Box>
          <Heading size="md" mb={4}>Health Indicators</Heading>
          <HStack gap={4}>
            <Badge
              colorScheme={health_indicators.completion_rate_status === 'good' ? 'green' : 'orange'}
              variant="subtle"
              px={3}
              py={1}
            >
              Completion Rate: {health_indicators.completion_rate_status}
            </Badge>
            <Badge
              colorScheme={health_indicators.estimation_accuracy_status === 'good' ? 'green' : 'orange'}
              variant="subtle"
              px={3}
              py={1}
            >
              Estimation Accuracy: {health_indicators.estimation_accuracy_status}
            </Badge>
          </HStack>
        </Box>

        {/* Recent Activity Placeholder */}
        <Box>
          <Heading size="md" mb={4}>Recent Activity</Heading>
          <Text color="gray.500">Recent activity data will be displayed here</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default Dashboard;
