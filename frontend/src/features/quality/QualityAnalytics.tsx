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

interface QualityMetrics {
  test_coverage: number;
  code_review_time: number;
  technical_debt_ratio: number;
  bug_density: number;
  code_complexity: number;
  documentation_coverage: number;
}

interface TechDebtImpact {
  tech_debt_ratio: number;
  estimated_velocity_improvement: number;
  recommendation: string;
}

const QualityAnalytics: React.FC = () => {
  const { selectedProject } = useProject();
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [techDebtImpact, setTechDebtImpact] = useState<TechDebtImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      loadQualityMetrics();
    }
  }, [selectedProject]);

  const loadQualityMetrics = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      // Mock quality metrics for demo
      const mockMetrics: QualityMetrics = {
        test_coverage: Math.floor(Math.random() * 30) + 70, // 70-100%
        code_review_time: Math.floor(Math.random() * 4) + 1, // 1-5 hours
        technical_debt_ratio: Math.floor(Math.random() * 25) + 5, // 5-30%
        bug_density: Math.floor(Math.random() * 15) + 5, // 5-20%
        code_complexity: Math.floor(Math.random() * 20) + 10, // 10-30%
        documentation_coverage: Math.floor(Math.random() * 40) + 60, // 60-100%
      };

      setMetrics(mockMetrics);

      // Mock tech debt impact
      const mockTechDebtImpact: TechDebtImpact = {
        tech_debt_ratio: mockMetrics.technical_debt_ratio,
        estimated_velocity_improvement: mockMetrics.technical_debt_ratio * 0.1,
        recommendation: mockMetrics.technical_debt_ratio > 20 ? 'Reduce technical debt' : 'Maintain current levels'
      };

      setTechDebtImpact(mockTechDebtImpact);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quality metrics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'green';
    if (value >= thresholds.warning) return 'yellow';
    return 'red';
  };

  const getQualityStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'Excellent';
    if (value >= thresholds.warning) return 'Good';
    return 'Needs Improvement';
  };

  if (!selectedProject) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view quality analytics</Text>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Heading size="lg" color="gray.800">
              Quality Analytics
            </Heading>
            <Text color="gray.600">Monitor and improve code quality metrics</Text>
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

        {/* Quality Metrics Overview */}
        {metrics && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="6" align="stretch">
              <Heading size="md" color="gray.700">
                Code Quality Metrics
              </Heading>
              
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="4">
                {/* Test Coverage */}
                <Box p="4" bg="gray.50" borderRadius="md">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="gray.700">Test Coverage</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getQualityColor(metrics.test_coverage, { good: 80, warning: 60 })}.600`}>
                      {metrics.test_coverage}%
                    </Text>
                    <Badge colorScheme={getQualityColor(metrics.test_coverage, { good: 80, warning: 60 })} variant="subtle">
                      {getQualityStatus(metrics.test_coverage, { good: 80, warning: 60 })}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">Percentage of code covered by tests</Text>
                  </VStack>
                </Box>

                {/* Code Review Time */}
                <Box p="4" bg="gray.50" borderRadius="md">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="gray.700">Code Review Time</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getQualityColor(metrics.code_review_time, { good: 2, warning: 4 })}.600`}>
                      {metrics.code_review_time}h
                    </Text>
                    <Badge colorScheme={getQualityColor(metrics.code_review_time, { good: 2, warning: 4 })} variant="subtle">
                      {getQualityStatus(metrics.code_review_time, { good: 2, warning: 4 })}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">Average time per review</Text>
                  </VStack>
                </Box>

                {/* Technical Debt Ratio */}
                <Box p="4" bg="gray.50" borderRadius="md">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="gray.700">Technical Debt</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getQualityColor(metrics.technical_debt_ratio, { good: 10, warning: 20 })}.600`}>
                      {metrics.technical_debt_ratio}%
                    </Text>
                    <Badge colorScheme={getQualityColor(metrics.technical_debt_ratio, { good: 10, warning: 20 })} variant="subtle">
                      {getQualityStatus(metrics.technical_debt_ratio, { good: 10, warning: 20 })}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">Ratio of technical debt issues</Text>
                  </VStack>
                </Box>

                {/* Bug Density */}
                <Box p="4" bg="gray.50" borderRadius="md">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="gray.700">Bug Density</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getQualityColor(metrics.bug_density, { good: 10, warning: 15 })}.600`}>
                      {metrics.bug_density}%
                    </Text>
                    <Badge colorScheme={getQualityColor(metrics.bug_density, { good: 10, warning: 15 })} variant="subtle">
                      {getQualityStatus(metrics.bug_density, { good: 10, warning: 15 })}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">Percentage of bug issues</Text>
                  </VStack>
                </Box>

                {/* Code Complexity */}
                <Box p="4" bg="gray.50" borderRadius="md">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="gray.700">Code Complexity</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getQualityColor(metrics.code_complexity, { good: 15, warning: 25 })}.600`}>
                      {metrics.code_complexity}%
                    </Text>
                    <Badge colorScheme={getQualityColor(metrics.code_complexity, { good: 15, warning: 25 })} variant="subtle">
                      {getQualityStatus(metrics.code_complexity, { good: 15, warning: 25 })}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">Complexity score</Text>
                  </VStack>
                </Box>

                {/* Documentation Coverage */}
                <Box p="4" bg="gray.50" borderRadius="md">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="gray.700">Documentation</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getQualityColor(metrics.documentation_coverage, { good: 80, warning: 60 })}.600`}>
                      {metrics.documentation_coverage}%
                    </Text>
                    <Badge colorScheme={getQualityColor(metrics.documentation_coverage, { good: 80, warning: 60 })} variant="subtle">
                      {getQualityStatus(metrics.documentation_coverage, { good: 80, warning: 60 })}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">Documentation coverage</Text>
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Technical Debt Impact Analysis */}
        {techDebtImpact && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                Technical Debt Impact Analysis
              </Heading>
              
              <Box p="4" bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="md">
                <VStack align="start" gap="2">
                  <Text fontWeight="semibold" color="orange.700">
                    Current Technical Debt: {techDebtImpact.tech_debt_ratio}%
                  </Text>
                  <Text fontSize="sm" color="orange.600">
                    Estimated velocity improvement if debt is reduced: {techDebtImpact.estimated_velocity_improvement}%
                  </Text>
                  <Text fontSize="sm" color="orange.600">
                    Recommendation: {techDebtImpact.recommendation}
                  </Text>
                </VStack>
              </Box>

              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
                <Box p="4" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="blue.700">Quality Score</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      {Math.round(100 - metrics!.technical_debt_ratio - metrics!.bug_density)}/100
                    </Text>
                    <Text fontSize="sm" color="blue.600">Overall quality rating</Text>
                  </VStack>
                </Box>

                <Box p="4" bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="green.700">Improvement Potential</Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                      {techDebtImpact.estimated_velocity_improvement}%
                    </Text>
                    <Text fontSize="sm" color="green.600">Velocity improvement if debt is reduced</Text>
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
            <VStack gap="4">
              <Spinner size="xl" color="blue.500" />
              <Text>Loading quality metrics...</Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default QualityAnalytics;
