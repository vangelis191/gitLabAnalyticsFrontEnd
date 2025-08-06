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

  // Mock team members - in real app, this would come from API
  const mockTeamMembers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown'];

  useEffect(() => {
    if (selectedProject) {
      setTeamMembers(mockTeamMembers);
    }
  }, [selectedProject]);

  const calculateCapacity = async () => {
    if (!selectedProject || teamMembers.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Mock capacity calculation for demo
      const mockCapacity: TeamCapacity = {};
      teamMembers.forEach(member => {
        const historicalVelocity = Math.floor(Math.random() * 20) + 10; // 10-30 hours
        const availableHours = sprintDuration * 40 * 0.8; // 80% of 40 hours per week
        mockCapacity[member] = {
          historical_velocity: historicalVelocity,
          available_hours: availableHours,
          recommended_capacity: Math.min(historicalVelocity, availableHours)
        };
      });

      setCapacity(mockCapacity);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate capacity';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const predictCommitment = async () => {
    if (!capacity) return;

    try {
      setLoading(true);
      setError(null);

      // Mock commitment prediction
      const totalCapacity = Object.values(capacity).reduce((sum, data) => sum + data.recommended_capacity, 0);
      const totalEstimatedEffort = totalCapacity * 1.2; // 20% more than capacity
      const recommendedCommitment = totalCapacity * 0.8; // 80% of capacity
      const commitmentProbability = recommendedCommitment / totalEstimatedEffort;
      
      const mockCommitment: SprintCommitment = {
        total_capacity: totalCapacity,
        total_estimated_effort: totalEstimatedEffort,
        recommended_commitment: recommendedCommitment,
        commitment_probability: commitmentProbability,
        risk_level: commitmentProbability < 0.8 ? 'high' : commitmentProbability < 0.95 ? 'medium' : 'low',
        accuracy_factor: 0.85
      };

      setCommitment(mockCommitment);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict commitment';
      setError(errorMessage);
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
