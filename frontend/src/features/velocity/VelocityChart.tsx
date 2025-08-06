import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import GitLabAnalyticsAPI, { type VelocityStats, type GitLabVelocity } from '../../services/api';
import { useProject } from '../../hooks/useProject';

interface Sprint {
  milestone_id: number;
  title: string;
  total_issues: number;
  closed_issues: number;
  velocity_hours: number;
  avg_hours_per_issue: number;
}

interface Milestone {
  milestone_id: number;
  milestone_title: string;
  total_issues: number;
  closed_issues: number;
  total_estimated_hours: number;
  total_spent_hours: number;
  velocity_estimated_hours: number;
  velocity_spent_hours: number;
  estimation_accuracy_percent: number;
  avg_hours_per_issue: number;
}

const VelocityChart: React.FC = () => {
  const { selectedProject } = useProject();
  const [velocityStats, setVelocityStats] = useState<VelocityStats | null>(null);
  const [gitlabVelocity, setGitlabVelocity] = useState<GitLabVelocity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResult, gitlabResult] = await Promise.all([
          GitLabAnalyticsAPI.getVelocityStats(undefined, selectedProject?.id),
          GitLabAnalyticsAPI.getGitLabVelocity(selectedProject?.id)
        ]);
        setVelocityStats(statsResult);
        setGitlabVelocity(gitlabResult);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch velocity data';
        setError(errorMessage);
        console.error('Velocity fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProject) {
      fetchData();
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view velocity data</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack gap="4">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading velocity data...</Text>
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

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          Velocity Analysis
        </Text>

        {/* Velocity Stats */}
        {velocityStats && (
          <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
              Velocity Statistics
            </Text>
            <VStack gap="4" align="stretch">
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Total Issues Closed:</Text>
                <Text fontWeight="bold" color="green.600">{velocityStats.total_issues_closed}</Text>
              </HStack>
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Average Velocity (Hours):</Text>
                <Text fontWeight="bold" color="blue.600">{velocityStats.average_velocity_hours?.toFixed(1) || '0.0'}</Text>
              </HStack>
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Backlog Remaining (Hours):</Text>
                <Text fontWeight="bold" color="orange.600">{velocityStats.backlog_remaining_hours}</Text>
              </HStack>
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Estimated Sprints to Finish:</Text>
                <Text fontWeight="bold" color="purple.600">{velocityStats.estimated_sprints_to_finish_backlog?.toFixed(1) || '0.0'}</Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Sprint Details */}
        {velocityStats && velocityStats.sprints && velocityStats.sprints.length > 0 && (
          <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
              Sprint Details
            </Text>
            <VStack gap="3" align="stretch">
              {velocityStats.sprints.map((sprint: Sprint, index: number) => (
                <Box key={index} p="4" bg="gray.50" borderRadius="md">
                  <VStack align="stretch" gap="2">
                    <Text fontWeight="semibold" color="gray.800">{sprint.title}</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Issues: {sprint.closed_issues}/{sprint.total_issues}</Text>
                      <Text fontSize="sm" color="green.600">
                        {sprint.total_issues > 0 ? ((sprint.closed_issues / sprint.total_issues) * 100).toFixed(1) : '0.0'}%
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Velocity Hours:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="blue.600">{sprint.velocity_hours}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Avg Hours per Issue:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="purple.600">{sprint.avg_hours_per_issue?.toFixed(1) || '0.0'}</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* GitLab Velocity */}
        {gitlabVelocity && gitlabVelocity.length > 0 && (
          <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
              GitLab Velocity Details
            </Text>
            <VStack gap="3" align="stretch">
              {gitlabVelocity.map((milestone: Milestone, index: number) => (
                <Box key={index} p="4" bg="gray.50" borderRadius="md">
                  <VStack align="stretch" gap="2">
                    <Text fontWeight="semibold" color="gray.800">{milestone.milestone_title}</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Issues: {milestone.closed_issues}/{milestone.total_issues}</Text>
                      <Text fontSize="sm" color="green.600">
                        {milestone.total_issues > 0 ? ((milestone.closed_issues / milestone.total_issues) * 100).toFixed(1) : '0.0'}%
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Estimated Hours:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="blue.600">{milestone.total_estimated_hours}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Spent Hours:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="orange.600">{milestone.total_spent_hours}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Estimation Accuracy:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="purple.600">{milestone.estimation_accuracy_percent?.toFixed(1) || '0.0'}%</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Avg Hours per Issue:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="teal.600">{milestone.avg_hours_per_issue?.toFixed(1) || '0.0'}</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default VelocityChart;
