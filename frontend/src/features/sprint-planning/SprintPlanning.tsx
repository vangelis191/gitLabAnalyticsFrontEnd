import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Button,
  Badge,
  Heading,
} from '@chakra-ui/react';
import { useProject } from '../../hooks/useProject';
import GitLabAnalyticsAPI from '../../services/api';

interface TeamCapacity {
  [member: string]: {
    historical_velocity: number;
    available_hours: number;
    recommended_capacity: number;
  };
}

interface SprintCommitment {
  total_capacity: number;
  total_estimated_effort: number;
  recommended_commitment: number;
  commitment_probability: number;
  risk_level: 'low' | 'medium' | 'high';
  accuracy_factor: number;
}

const SprintPlanning: React.FC = () => {
  const { selectedProject } = useProject();
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [sprintDuration, setSprintDuration] = useState<number>(2);
  const [capacity, setCapacity] = useState<TeamCapacity | null>(null);
  const [commitment, setCommitment] = useState<SprintCommitment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get team members from API when project is selected
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedProject) return;

      try {
        setLoading(true);
        setError(null);
        
        // Get team capacity data which includes team members
        const teamCapacityData = await GitLabAnalyticsAPI.getTeamCapacity(selectedProject.id);
        console.log('🔍 Debug - Team Capacity Data:', teamCapacityData);
        const members = teamCapacityData.map(member => member.team_member);
        console.log('🔍 Debug - Extracted Team Members:', members);
        setTeamMembers(members);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team members';
        setError(errorMessage);
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [selectedProject]);

  const calculateCapacity = async () => {
    if (!selectedProject || teamMembers.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Get real capacity data from API
      const apiCapacityData = await GitLabAnalyticsAPI.getSprintPlanningCapacity(sprintDuration, teamMembers, selectedProject!.id);
      
      console.log('🔍 Debug - Team Members:', teamMembers);
      console.log('🔍 Debug - API Capacity Data:', apiCapacityData);
      
      // Transform API data to match component interface
      const transformedCapacity: TeamCapacity = {};
      
      // Handle both array and object formats from API
      if (Array.isArray(apiCapacityData)) {
        // API returned array format
        apiCapacityData.forEach((memberData) => {
          transformedCapacity[memberData.team_member] = {
            historical_velocity: memberData.velocity_hours || 0,
            available_hours: memberData.total_estimated_hours || 0,
            recommended_capacity: Math.min(memberData.velocity_hours || 0, memberData.total_estimated_hours || 0)
          };
        });
      } else {
        // API returned object format
        Object.entries(apiCapacityData).forEach(([member, data]) => {
          transformedCapacity[member] = {
            historical_velocity: data.historical_velocity,
            available_hours: data.available_hours,
            recommended_capacity: data.recommended_capacity
          };
        });
      }

      console.log('🔍 Debug - Transformed Capacity:', transformedCapacity);
      setCapacity(transformedCapacity);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate capacity';
      setError(errorMessage);
      console.error('Error calculating capacity:', err);
    } finally {
      setLoading(false);
    }
  };

  const predictCommitment = async () => {
    if (!capacity) return;

    try {
      setLoading(true);
      setError(null);

      // Get real commitment data from API
      const apiCommitmentData = await GitLabAnalyticsAPI.getSprintPlanningCommitment(sprintDuration, teamMembers, selectedProject!.id);
      
      // Transform API data to match component interface
      const transformedCommitment: SprintCommitment = {
        total_capacity: apiCommitmentData.total_capacity,
        total_estimated_effort: apiCommitmentData.total_estimated_effort,
        recommended_commitment: apiCommitmentData.recommended_commitment,
        commitment_probability: apiCommitmentData.commitment_probability,
        risk_level: apiCommitmentData.risk_level,
        accuracy_factor: apiCommitmentData.accuracy_factor
      };

      setCommitment(transformedCommitment);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict commitment';
      setError(errorMessage);
      console.error('Error predicting commitment:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  if (!selectedProject) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view sprint planning</Text>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Heading size="lg" color="gray.800">
              Sprint Planning
            </Heading>
            <Text color="gray.600">Plan your sprint with data-driven insights</Text>
          </VStack>
          <Badge colorScheme="blue" variant="subtle" fontSize="md">
            {selectedProject.name}
          </Badge>
        </HStack>

        {/* Configuration Section */}
        <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
          <VStack gap="4" align="stretch">
            <Heading size="md" color="gray.700">
              Sprint Configuration
            </Heading>
            
            <HStack gap="4">
              <Box flex="1">
                <Text fontWeight="medium" mb="2">Sprint Duration (weeks)</Text>
                <select
                  value={sprintDuration}
                  onChange={(e) => setSprintDuration(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value={1}>1 week</option>
                  <option value={2}>2 weeks</option>
                  <option value={3}>3 weeks</option>
                  <option value={4}>4 weeks</option>
                </select>
              </Box>
              <Box flex="1">
                <Text fontWeight="medium" mb="2">Team Members</Text>
                <Text color="gray.600">{teamMembers.length} members selected</Text>
              </Box>
            </HStack>
            
            <HStack gap="4">
              <Button
                colorScheme="blue"
                onClick={calculateCapacity}
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Calculate Capacity'}
              </Button>
              <Button
                colorScheme="green"
                onClick={predictCommitment}
                disabled={loading || !capacity}
              >
                {loading ? 'Predicting...' : 'Predict Commitment'}
              </Button>
            </HStack>
          </VStack>
        </Box>

        {error && (
          <Box p="4" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
            <Text color="red.600">{error}</Text>
          </Box>
        )}

        {/* Team Capacity Results */}
        {capacity && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                Team Capacity Analysis
              </Heading>
              
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="4">
                {Object.entries(capacity).map(([member, data]) => (
                  <Box key={member} p="4" bg="gray.50" borderRadius="md">
                    <VStack gap="3" align="stretch">
                      <Text fontWeight="semibold" color="gray.700">{member}</Text>
                      
                      <Box>
                        <Text fontSize="sm" color="gray.600">Historical Velocity</Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.600">{data.historical_velocity}h</Text>
                        <Text fontSize="xs" color="gray.500">Average per sprint</Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color="gray.600">Available Hours</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">{data.available_hours}h</Text>
                        <Text fontSize="xs" color="gray.500">This sprint</Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" color="gray.600">Recommended Capacity</Text>
                        <Text fontSize="lg" fontWeight="bold" color="purple.600">{data.recommended_capacity}h</Text>
                        <Text fontSize="xs" color="gray.500">Optimal commitment</Text>
                      </Box>
                    </VStack>
                  </Box>
                ))}
              </Box>
            </VStack>
          </Box>
        )}

        {/* Sprint Commitment Prediction */}
        {commitment && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="6" align="stretch">
              <Heading size="md" color="gray.700">
                Sprint Commitment Prediction
              </Heading>
              
              {/* Risk Level Alert */}
              <Box p="4" bg={`${getRiskColor(commitment.risk_level)}.50`} border="1px solid" borderColor={`${getRiskColor(commitment.risk_level)}.200`} borderRadius="md">
                <VStack align="start" gap="1">
                  <Text fontWeight="semibold" color={`${getRiskColor(commitment.risk_level)}.700`}>
                    Risk Level: {commitment.risk_level.toUpperCase()}
                  </Text>
                  <Text fontSize="sm" color={`${getRiskColor(commitment.risk_level)}.600`}>
                    {commitment.risk_level === 'high' && 'High risk of not completing sprint goals'}
                    {commitment.risk_level === 'medium' && 'Moderate risk - consider reducing scope'}
                    {commitment.risk_level === 'low' && 'Low risk - sprint goals are achievable'}
                  </Text>
                </VStack>
              </Box>

              {/* Key Metrics */}
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="4">
                <Box>
                  <Text fontSize="sm" color="gray.600">Total Capacity</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">{commitment.total_capacity}h</Text>
                  <Text fontSize="xs" color="gray.500">Team availability</Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600">Estimated Effort</Text>
                  <Text fontSize="xl" fontWeight="bold" color="orange.600">{commitment.total_estimated_effort}h</Text>
                  <Text fontSize="xs" color="gray.500">Backlog requirements</Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600">Recommended Commitment</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">{commitment.recommended_commitment}h</Text>
                  <Text fontSize="xs" color="gray.500">Optimal sprint goal</Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600">Success Probability</Text>
                  <Text fontSize="xl" fontWeight="bold" color="purple.600">{Math.round(commitment.commitment_probability * 100)}%</Text>
                  <Text fontSize="xs" color="gray.500">Likelihood of completion</Text>
                </Box>
              </Box>

              {/* Commitment Progress */}
              <Box>
                <HStack justify="space-between" mb="2">
                  <Text fontWeight="medium">Commitment vs Capacity</Text>
                  <Text fontSize="sm" color="gray.600">
                    {Math.round((commitment.recommended_commitment / commitment.total_capacity) * 100)}% utilization
                  </Text>
                </HStack>
                <Box
                  w="100%"
                  h="8px"
                  bg="gray.200"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    bg={commitment.risk_level === 'high' ? 'red.500' : commitment.risk_level === 'medium' ? 'yellow.500' : 'green.500'}
                    w={`${(commitment.recommended_commitment / commitment.total_capacity) * 100}%`}
                    transition="width 0.3s ease"
                  />
                </Box>
              </Box>

              {/* Recommendations */}
              <Box p="4" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <VStack align="start" gap="2">
                  <Text fontWeight="semibold" color="blue.700">Recommendations</Text>
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" color="blue.600">
                      • Commit to {commitment.recommended_commitment}h of work
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Estimation accuracy factor: {commitment.accuracy_factor}
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Consider reducing scope if probability &lt; 80%
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
            <VStack gap="4">
              <Spinner size="xl" color="blue.500" />
              <Text>Processing sprint planning data...</Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default SprintPlanning;
