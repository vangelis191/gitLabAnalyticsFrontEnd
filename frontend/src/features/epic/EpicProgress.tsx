import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import GitLabAnalyticsAPI, { type EpicSuccess, type EpicStatus, type Epic } from '../../services/api';
import { useProject } from '../../contexts/ProjectContext';

interface EpicSuccessItem {
  epic_id: number;
  epic_title: string;
  successful: boolean;
}

interface MilestoneItem {
  milestone_id: number;
  title: string;
  total_issues: number;
  closed_issues: number;
  progress_percent: number;
  successful: boolean;
}

const EpicProgress: React.FC = () => {
  const { selectedProject } = useProject();
  const [epicSuccess, setEpicSuccess] = useState<EpicSuccess[]>([]);
  const [epicStatus, setEpicStatus] = useState<EpicStatus | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [successResult, statusResult, epicsResult] = await Promise.all([
          GitLabAnalyticsAPI.getEpicSuccess(selectedProject?.id),
          GitLabAnalyticsAPI.getEpicStatus(selectedProject?.id),
          GitLabAnalyticsAPI.getEpics(selectedProject?.id)
        ]);
        setEpicSuccess(successResult);
        setEpicStatus(statusResult.length > 0 ? statusResult[0] : null);
        setEpics(epicsResult);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch epic data';
        setError(errorMessage);
        console.error('Epic fetch error:', err);
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
        <Text color="yellow.600">Please select a project to view epic data</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack gap="4">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading epic data...</Text>
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
          Epic Progress Tracking
        </Text>

        {/* Epic Success */}
        {epicSuccess && epicSuccess.length > 0 && (
          <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
              Epic Success Status
            </Text>
            <VStack gap="3" align="stretch">
              {epicSuccess.map((epic: EpicSuccessItem, index: number) => (
                <Box key={index} p="4" bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">{epic.epic_title}</Text>
                    <Text 
                      fontSize="sm" 
                      fontWeight="medium"
                      color={epic.successful ? 'green.600' : 'red.600'}
                      bg={epic.successful ? 'green.100' : 'red.100'}
                      px="2"
                      py="1"
                      borderRadius="full"
                    >
                      {epic.successful ? 'Successful' : 'Failed'}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Epic Status */}
        {epicStatus && (
          <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
              Epic Status Details
            </Text>
            <VStack gap="4" align="stretch">
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Epic Title:</Text>
                <Text fontWeight="bold" color="blue.600">{epicStatus.epic_title}</Text>
              </HStack>
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Start Date:</Text>
                <Text fontWeight="bold" color="green.600">{epicStatus.start_date}</Text>
              </HStack>
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Due Date:</Text>
                <Text fontWeight="bold" color="orange.600">{epicStatus.due_date}</Text>
              </HStack>
              <HStack justify="space-between" p="3" bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">Status:</Text>
                <Text 
                  fontWeight="bold" 
                  color={epicStatus.successful ? 'green.600' : 'red.600'}
                >
                  {epicStatus.successful ? 'Successful' : 'Failed'}
                </Text>
              </HStack>
            </VStack>

            {/* Milestones */}
            {epicStatus.milestones && epicStatus.milestones.length > 0 && (
              <Box mt="4">
                <Text fontSize="md" fontWeight="semibold" mb="3" color="gray.700">
                  Milestones
                </Text>
                <VStack gap="2" align="stretch">
                  {epicStatus.milestones.map((milestone: MilestoneItem, index: number) => (
                    <Box key={index} p="3" bg="gray.50" borderRadius="md">
                      <VStack align="stretch" gap="2">
                        <Text fontWeight="medium" color="gray.800">{milestone.title}</Text>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Issues: {milestone.closed_issues}/{milestone.total_issues}</Text>
                          <Text fontSize="sm" color="green.600">
                            {((milestone.closed_issues / milestone.total_issues) * 100).toFixed(1)}%
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Progress:</Text>
                          <Text fontSize="sm" fontWeight="medium" color="blue.600">{milestone.progress_percent.toFixed(1)}%</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Status:</Text>
                          <Text 
                            fontSize="sm" 
                            fontWeight="medium"
                            color={milestone.successful ? 'green.600' : 'red.600'}
                          >
                            {milestone.successful ? 'Successful' : 'Failed'}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* Epics List */}
        {epics && epics.length > 0 && (
          <Box p="6" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="semibold" mb="4" color="gray.700">
              All Epics
            </Text>
            <VStack gap="3" align="stretch">
              {epics.map((epic: Epic, index: number) => (
                <Box key={index} p="4" bg="gray.50" borderRadius="md">
                  <VStack align="stretch" gap="2">
                    <Text fontWeight="semibold" color="gray.800">{epic.title}</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Start Date:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.600">{epic.start_date}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Due Date:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="orange.600">{epic.due_date}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Project ID:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="blue.600">{epic.project_id}</Text>
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

export default EpicProgress;
