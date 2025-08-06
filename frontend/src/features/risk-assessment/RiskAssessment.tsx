import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Badge,
  Heading,
} from '@chakra-ui/react';
import { useProject } from '../../hooks/useProject';

interface SprintRisk {
  sprint_id: number;
  sprint_title: string;
  overall_risk_score: number;
  risk_breakdown: {
    scope_creep_risk: number;
    resource_availability_risk: number;
    technical_risk: number;
    dependency_risk: number;
    quality_risk: number;
  };
  risk_level: 'low' | 'medium' | 'high';
  mitigation_strategies: string[];
}

interface ProjectRisk {
  project_id: number;
  average_risk_score: number;
  sprint_risks: SprintRisk[];
  overall_risk_level: 'low' | 'medium' | 'high';
}

const RiskAssessment: React.FC = () => {
  const { selectedProject } = useProject();
  const [projectRisk, setProjectRisk] = useState<ProjectRisk | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      loadRiskAssessment();
    }
  }, [selectedProject]);

  const loadRiskAssessment = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      // Mock risk assessment data
      const mockSprintRisks: SprintRisk[] = [
        {
          sprint_id: 1,
          sprint_title: "Sprint 1 - Foundation",
          overall_risk_score: Math.floor(Math.random() * 30) + 20, // 20-50
          risk_breakdown: {
            scope_creep_risk: Math.floor(Math.random() * 40) + 10,
            resource_availability_risk: Math.floor(Math.random() * 30) + 15,
            technical_risk: Math.floor(Math.random() * 35) + 10,
            dependency_risk: Math.floor(Math.random() * 25) + 5,
            quality_risk: Math.floor(Math.random() * 20) + 10,
          },
          risk_level: 'medium',
          mitigation_strategies: [
            "Implement strict change control process",
            "Review scope changes with stakeholders"
          ]
        },
        {
          sprint_id: 2,
          sprint_title: "Sprint 2 - Core Features",
          overall_risk_score: Math.floor(Math.random() * 40) + 30, // 30-70
          risk_breakdown: {
            scope_creep_risk: Math.floor(Math.random() * 50) + 20,
            resource_availability_risk: Math.floor(Math.random() * 40) + 20,
            technical_risk: Math.floor(Math.random() * 45) + 25,
            dependency_risk: Math.floor(Math.random() * 35) + 15,
            quality_risk: Math.floor(Math.random() * 30) + 15,
          },
          risk_level: 'high',
          mitigation_strategies: [
            "Break down complex issues into smaller tasks",
            "Allocate more time for technical spikes"
          ]
        },
        {
          sprint_id: 3,
          sprint_title: "Sprint 3 - Integration",
          overall_risk_score: Math.floor(Math.random() * 25) + 15, // 15-40
          risk_breakdown: {
            scope_creep_risk: Math.floor(Math.random() * 30) + 5,
            resource_availability_risk: Math.floor(Math.random() * 25) + 10,
            technical_risk: Math.floor(Math.random() * 30) + 15,
            dependency_risk: Math.floor(Math.random() * 20) + 10,
            quality_risk: Math.floor(Math.random() * 15) + 5,
          },
          risk_level: 'low',
          mitigation_strategies: [
            "Identify and resolve dependencies early",
            "Create dependency map and mitigation plan"
          ]
        }
      ];

      const averageRiskScore = Math.round(
        mockSprintRisks.reduce((sum, sprint) => sum + sprint.overall_risk_score, 0) / mockSprintRisks.length
      );

      const mockProjectRisk: ProjectRisk = {
        project_id: selectedProject.id,
        average_risk_score: averageRiskScore,
        sprint_risks: mockSprintRisks,
        overall_risk_level: averageRiskScore > 50 ? 'high' : averageRiskScore > 30 ? 'medium' : 'low'
      };

      setProjectRisk(mockProjectRisk);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load risk assessment';
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 60) return 'red';
    if (score >= 40) return 'yellow';
    return 'green';
  };

  if (!selectedProject) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view risk assessment</Text>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Heading size="lg" color="gray.800">
              Risk Assessment
            </Heading>
            <Text color="gray.600">Identify and mitigate project risks</Text>
          </VStack>
          <Badge colorScheme="blue" variant="subtle" fontSize="md">
            {selectedProject.name}
          </Badge>
        </HStack>

        {error && (
          <Box p="4" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
            <Text color="red.600">{error}</Text>
          </Box>
        )}

        {/* Overall Project Risk */}
        {projectRisk && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                Overall Project Risk Assessment
              </Heading>
              
              <Box p="4" bg={`${getRiskColor(projectRisk.overall_risk_level)}.50`} border="1px solid" borderColor={`${getRiskColor(projectRisk.overall_risk_level)}.200`} borderRadius="md">
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap="1">
                    <Text fontWeight="semibold" color={`${getRiskColor(projectRisk.overall_risk_level)}.700`}>
                      Project Risk Level: {projectRisk.overall_risk_level.toUpperCase()}
                    </Text>
                    <Text fontSize="sm" color={`${getRiskColor(projectRisk.overall_risk_level)}.600`}>
                      Average Risk Score: {projectRisk.average_risk_score}/100
                    </Text>
                  </VStack>
                  <Badge colorScheme={getRiskColor(projectRisk.overall_risk_level)} variant="solid" fontSize="lg">
                    {projectRisk.average_risk_score}
                  </Badge>
                </HStack>
              </Box>

              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4">
                <Box p="4" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="blue.700">Total Sprints</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      {projectRisk.sprint_risks.length}
                    </Text>
                    <Text fontSize="sm" color="blue.600">Analyzed sprints</Text>
                  </VStack>
                </Box>

                <Box p="4" bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="orange.700">High Risk Sprints</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                      {projectRisk.sprint_risks.filter(s => s.risk_level === 'high').length}
                    </Text>
                    <Text fontSize="sm" color="orange.600">Need attention</Text>
                  </VStack>
                </Box>

                <Box p="4" bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="green.700">Low Risk Sprints</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {projectRisk.sprint_risks.filter(s => s.risk_level === 'low').length}
                    </Text>
                    <Text fontSize="sm" color="green.600">On track</Text>
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Sprint Risk Breakdown */}
        {projectRisk && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                Sprint Risk Breakdown
              </Heading>
              
              <VStack gap="4" align="stretch">
                {projectRisk.sprint_risks.map((sprint) => (
                  <Box key={sprint.sprint_id} p="4" bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <VStack gap="4" align="stretch">
                      <HStack justify="space-between" align="center">
                        <VStack align="start" gap="1">
                          <Text fontWeight="semibold" color="gray.700">{sprint.sprint_title}</Text>
                          <Text fontSize="sm" color="gray.600">Sprint {sprint.sprint_id}</Text>
                        </VStack>
                        <Badge colorScheme={getRiskColor(sprint.risk_level)} variant="solid">
                          {sprint.risk_level.toUpperCase()}
                        </Badge>
                      </HStack>

                      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }} gap="3">
                        <Box>
                          <Text fontSize="sm" color="gray.600">Scope Creep</Text>
                          <Text fontSize="lg" fontWeight="bold" color={`${getRiskScoreColor(sprint.risk_breakdown.scope_creep_risk)}.600`}>
                            {sprint.risk_breakdown.scope_creep_risk}%
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Resources</Text>
                          <Text fontSize="lg" fontWeight="bold" color={`${getRiskScoreColor(sprint.risk_breakdown.resource_availability_risk)}.600`}>
                            {sprint.risk_breakdown.resource_availability_risk}%
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Technical</Text>
                          <Text fontSize="lg" fontWeight="bold" color={`${getRiskScoreColor(sprint.risk_breakdown.technical_risk)}.600`}>
                            {sprint.risk_breakdown.technical_risk}%
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Dependencies</Text>
                          <Text fontSize="lg" fontWeight="bold" color={`${getRiskScoreColor(sprint.risk_breakdown.dependency_risk)}.600`}>
                            {sprint.risk_breakdown.dependency_risk}%
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Quality</Text>
                          <Text fontSize="lg" fontWeight="bold" color={`${getRiskScoreColor(sprint.risk_breakdown.quality_risk)}.600`}>
                            {sprint.risk_breakdown.quality_risk}%
                          </Text>
                        </Box>
                      </Box>

                      <Box>
                        <HStack justify="space-between" mb="2">
                          <Text fontWeight="medium">Overall Risk Score</Text>
                          <Text fontSize="sm" color="gray.600">
                            {sprint.overall_risk_score}/100
                          </Text>
                        </HStack>
                        <Box
                          w="100%"
                          h="6px"
                          bg="gray.200"
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Box
                            h="100%"
                            bg={getRiskScoreColor(sprint.overall_risk_score)}
                            w={`${sprint.overall_risk_score}%`}
                            transition="width 0.3s ease"
                          />
                        </Box>
                      </Box>

                      {sprint.mitigation_strategies.length > 0 && (
                        <Box p="3" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                          <VStack align="start" gap="2">
                            <Text fontWeight="semibold" color="blue.700" fontSize="sm">Mitigation Strategies</Text>
                            <VStack align="start" gap="1">
                              {sprint.mitigation_strategies.map((strategy, index) => (
                                <Text key={index} fontSize="sm" color="blue.600">
                                  • {strategy}
                                </Text>
                              ))}
                            </VStack>
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
            <VStack gap="4">
              <Spinner size="xl" color="blue.500" />
              <Text>Loading risk assessment...</Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default RiskAssessment;
