import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Heading,
  Badge,
  createToaster,
} from '@chakra-ui/react';
import { FiUsers, FiClock, FiTrendingUp, FiTarget } from 'react-icons/fi';
import GitLabAnalyticsAPI from '../../services/api';
import type { Developer, BulkCapacityResponse, SprintPlanningCommitment } from '../../services/api';
import { useProject } from '../../hooks/useProject';

const CapacityPlanning: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [sprintDuration, setSprintDuration] = useState(2);
  const [capacityData, setCapacityData] = useState<BulkCapacityResponse | null>(null);
  const [commitmentData, setCommitmentData] = useState<SprintPlanningCommitment | null>(null);
  const [loading, setLoading] = useState(false);
  const { selectedProject } = useProject();
  const toaster = createToaster({
    placement: 'top',
  });

  const loadDevelopers = useCallback(async () => {
    try {
      const data = await GitLabAnalyticsAPI.getAllDevelopers(selectedProject?.id);
      const activeDevelopers = data.filter(dev => dev.is_active);
      setDevelopers(activeDevelopers);
      // Auto-select all active developers
      setSelectedDevelopers(activeDevelopers.map(dev => dev.name));
    } catch (error) {
      console.error('Error loading developers:', error);
      toaster.create({
        title: 'Error loading developers',
        description: 'Failed to fetch developers list',
        type: 'error',
        duration: 5000,
      });
    }
  }, [selectedProject?.id, toaster]);

  useEffect(() => {
    loadDevelopers();
  }, [loadDevelopers]);

  const calculateCapacity = async () => {
    if (selectedDevelopers.length === 0) {
      toaster.create({
        title: 'No developers selected',
        description: 'Please select at least one developer',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const [capacity, commitment] = await Promise.all([
        GitLabAnalyticsAPI.getBulkCapacity({
          team_members: selectedDevelopers,
          sprint_duration: sprintDuration,
        }),
        GitLabAnalyticsAPI.getSprintPlanningCommitment(
          sprintDuration,
          selectedDevelopers,
          selectedProject?.id
        ),
      ]);

      setCapacityData(capacity);
      setCommitmentData(commitment);
    } catch (error) {
      console.error('Error calculating capacity:', error);
      toaster.create({
        title: 'Error calculating capacity',
        description: 'Failed to calculate team capacity',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getUtilizationColor = (utilization: string) => {
    switch (utilization) {
      case 'optimal': return 'green';
      case 'underutilized': return 'blue';
      case 'overutilized': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HStack gap={3}>
          <FiTarget size={24} />
          <Heading size="lg">Sprint Capacity Planning</Heading>
        </HStack>

        {!selectedProject && (
          <Box bg="yellow.50" border="1px" borderColor="yellow.200" p={4} borderRadius="md">
            <Text color="yellow.800">Please select a project to view capacity planning data.</Text>
          </Box>
        )}

        {/* Configuration */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Heading size="md" mb={4}>Planning Configuration</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
              <Box>
                <Text fontWeight="medium" mb={2}>Sprint Duration (weeks)</Text>
                <input
                  type="number"
                  value={sprintDuration}
                  onChange={(e) => setSprintDuration(parseInt(e.target.value) || 2)}
                  min={1}
                  max={8}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    width: '100%',
                  }}
                />
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>Team Members</Text>
                <Box maxH="200px" overflowY="auto" border="1px" borderColor="gray.200" p={3} borderRadius="md">
                  {developers.map((dev) => (
                    <Box key={dev.name} mb={2}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedDevelopers.includes(dev.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDevelopers([...selectedDevelopers, dev.name]);
                            } else {
                              setSelectedDevelopers(selectedDevelopers.filter(name => name !== dev.name));
                            }
                          }}
                          style={{ marginRight: '8px' }}
                        />
                        <Text>{dev.name} ({dev.team_name})</Text>
                      </label>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            <HStack mt={4}>
              <Button
                colorScheme="blue"
                onClick={calculateCapacity}
                disabled={!selectedProject || loading}
              >
                {loading ? 'Calculating...' : 'Calculate Capacity'}
              </Button>
              <Text color="gray.500">
                Selected: {selectedDevelopers.length} developers
              </Text>
            </HStack>
        </Box>

        {/* Summary Stats */}
        {capacityData && commitmentData && (
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" mb={1}>Total Capacity</Text>
              <Text fontSize="2xl" fontWeight="bold" mb={2}>{capacityData.total_capacity.toFixed(1)}h</Text>
              <HStack gap={1}>
                <FiClock />
                <Text fontSize="sm" color="gray.500">{sprintDuration} week sprint</Text>
              </HStack>
            </Box>

            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" mb={1}>Team Size</Text>
              <Text fontSize="2xl" fontWeight="bold" mb={2}>{selectedDevelopers.length}</Text>
              <HStack gap={1}>
                <FiUsers />
                <Text fontSize="sm" color="gray.500">Active developers</Text>
              </HStack>
            </Box>

            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" mb={1}>Commitment Probability</Text>
              <Text fontSize="2xl" fontWeight="bold" mb={2}>{(commitmentData.commitment_probability * 100).toFixed(0)}%</Text>
              <Badge colorScheme={getRiskLevelColor(commitmentData.risk_level)}>
                {commitmentData.risk_level} risk
              </Badge>
            </Box>

            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" mb={1}>Accuracy Factor</Text>
              <Text fontSize="2xl" fontWeight="bold" mb={2}>{(commitmentData.accuracy_factor * 100).toFixed(0)}%</Text>
              <HStack gap={1}>
                <FiTrendingUp />
                <Text fontSize="sm" color="gray.500">Historical accuracy</Text>
              </HStack>
            </Box>
          </Grid>
        )}

        {/* Detailed Capacity Breakdown */}
        {capacityData && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Heading size="md" mb={4}>Individual Capacity Breakdown</Heading>
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4A5568' }}>Developer</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4A5568' }}>Historical Velocity</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4A5568' }}>Available Hours</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4A5568' }}>Recommended Capacity</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4A5568' }}>Hours/Day</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4A5568' }}>Availability</th>
                    {commitmentData?.team_breakdown && <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4A5568' }}>Utilization</th>}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(capacityData.team_capacity).map(([developerName, capacity]) => {
                    const utilization = commitmentData?.team_breakdown?.[developerName]?.utilization;
                    return (
                      <tr key={developerName} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{developerName}</td>
                        <td style={{ padding: '12px' }}>{capacity.historical_velocity?.toFixed(1) || 'N/A'}h</td>
                        <td style={{ padding: '12px' }}>{capacity.available_hours?.toFixed(1)}h</td>
                        <td style={{ padding: '12px' }}>{capacity.recommended_capacity?.toFixed(1)}h</td>
                        <td style={{ padding: '12px' }}>{capacity.working_hours_per_day}h</td>
                        <td style={{ padding: '12px' }}>{(capacity.availability_factor * 100).toFixed(0)}%</td>
                        {utilization && (
                          <td style={{ padding: '12px' }}>
                            <Badge colorScheme={getUtilizationColor(utilization)}>
                              {utilization}
                            </Badge>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Box>
        )}

        {/* Sprint Commitment Analysis */}
        {commitmentData && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Heading size="md" mb={4}>Sprint Commitment Analysis</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
                <VStack align="start" gap={3}>
                  <Text fontWeight="medium">Capacity Overview</Text>
                  <HStack justify="space-between" w="full">
                    <Text>Total Team Capacity:</Text>
                    <Text fontWeight="bold">{commitmentData.total_capacity.toFixed(1)}h</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Estimated Effort:</Text>
                    <Text fontWeight="bold">{commitmentData.total_estimated_effort.toFixed(1)}h</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Recommended Commitment:</Text>
                    <Text fontWeight="bold" color="blue.500">
                      {commitmentData.recommended_commitment.toFixed(1)}h
                    </Text>
                  </HStack>
                </VStack>

                <VStack align="start" gap={3}>
                  <Text fontWeight="medium">Risk Assessment</Text>
                  <HStack justify="space-between" w="full">
                    <Text>Risk Level:</Text>
                    <Badge colorScheme={getRiskLevelColor(commitmentData.risk_level)} size="lg">
                      {commitmentData.risk_level.toUpperCase()}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Success Probability:</Text>
                    <Text fontWeight="bold" color={commitmentData.commitment_probability > 0.8 ? 'green.500' : 'orange.500'}>
                      {(commitmentData.commitment_probability * 100).toFixed(0)}%
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Accuracy Factor:</Text>
                    <Text fontWeight="bold">
                      {(commitmentData.accuracy_factor * 100).toFixed(0)}%
                    </Text>
                  </HStack>
                </VStack>
              </Grid>

              {commitmentData.risk_level === 'high' && (
                <Box bg="orange.50" border="1px" borderColor="orange.200" p={4} borderRadius="md" mt={4}>
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold" color="orange.800">High Risk Sprint Detected</Text>
                    <Text fontSize="sm" color="orange.700">
                      Consider reducing scope or extending timeline to improve success probability.
                    </Text>
                  </VStack>
                </Box>
              )}

              {commitmentData.risk_level === 'low' && commitmentData.commitment_probability > 0.9 && (
                <Box bg="green.50" border="1px" borderColor="green.200" p={4} borderRadius="md" mt={4}>
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold" color="green.800">Optimal Sprint Capacity</Text>
                    <Text fontSize="sm" color="green.700">
                      Team capacity is well-balanced for successful sprint completion.
                    </Text>
                  </VStack>
                </Box>
              )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default CapacityPlanning;
