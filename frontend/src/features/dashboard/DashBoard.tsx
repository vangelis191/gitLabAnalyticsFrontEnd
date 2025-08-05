import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import GitLabAnalyticsAPI, { type DashboardOverview } from '../../services/api';

interface Activity {
  id: number;
  title: string;
  assignee: string;
  milestone_title: string;
  state: string;
  updated_date: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await GitLabAnalyticsAPI.getDashboardOverview();
        setData(result);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack gap="4">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading dashboard data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="6" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
        <Text color="red.600" fontWeight="medium">Error: {error}</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">No dashboard data available</Text>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          Dashboard Overview
        </Text>

        {/* Summary Stats */}
        <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
            Project Summary
          </Text>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Total Projects:</Text>
              <Text fontWeight="bold" color="blue.600">{data.summary.total_projects}</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Total Milestones:</Text>
              <Text fontWeight="bold" color="blue.600">{data.summary.total_milestones}</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Total Epics:</Text>
              <Text fontWeight="bold" color="blue.600">{data.summary.total_epics}</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Total Issues:</Text>
              <Text fontWeight="bold" color="blue.600">{data.summary.total_issues}</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Closed Issues:</Text>
              <Text fontWeight="bold" color="green.600">{data.summary.total_closed_issues}</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Completion Rate:</Text>
              <Text fontWeight="bold" color="green.600">{data.summary.overall_completion_rate.toFixed(1)}%</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Estimation Accuracy:</Text>
              <Text fontWeight="bold" color="purple.600">{data.summary.estimation_accuracy.toFixed(1)}%</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Total Estimated Hours:</Text>
              <Text fontWeight="bold" color="orange.600">{data.summary.total_estimated_hours}</Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Total Spent Hours:</Text>
              <Text fontWeight="bold" color="orange.600">{data.summary.total_spent_hours}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Health Indicators */}
        <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
            Health Indicators
          </Text>
          <VStack gap="3" align="stretch">
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Completion Rate Status:</Text>
              <Text 
                fontWeight="bold" 
                color={data.health_indicators.completion_rate_status === 'good' ? 'green.600' : 'orange.600'}
              >
                {data.health_indicators.completion_rate_status}
              </Text>
            </HStack>
            <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
              <Text fontWeight="medium">Estimation Accuracy Status:</Text>
              <Text 
                fontWeight="bold" 
                color={data.health_indicators.estimation_accuracy_status === 'good' ? 'green.600' : 'orange.600'}
              >
                {data.health_indicators.estimation_accuracy_status}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Recent Activity */}
        {data.recent_activity && data.recent_activity.length > 0 && (
          <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
              Recent Activity
            </Text>
            <VStack gap="2" align="stretch">
              {data.recent_activity.slice(0, 5).map((activity: unknown, index: number) => (
                <Box key={index} p="3" bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <VStack align="start" gap="1">
                      <Text fontWeight="medium" fontSize="sm">{(activity as Activity).title}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {(activity as Activity).assignee} • {(activity as Activity).milestone_title}
                      </Text>
                    </VStack>
                    <Text 
                      fontSize="xs" 
                      fontWeight="medium"
                      color={(activity as Activity).state === 'closed' ? 'green.600' : 'orange.600'}
                      bg={(activity as Activity).state === 'closed' ? 'green.100' : 'orange.100'}
                      px="2"
                      py="1"
                      borderRadius="full"
                    >
                      {(activity as Activity).state}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default Dashboard;
