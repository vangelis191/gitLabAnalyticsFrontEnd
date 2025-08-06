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
import { RetrospectiveService } from './retrospectiveService';
import type { RetrospectiveInsights } from './retrospectiveService';

const RetrospectiveAnalytics: React.FC = () => {
  const { selectedProject } = useProject();
  const [insights, setInsights] = useState<RetrospectiveInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSprints, setAvailableSprints] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedProject) {
      loadAvailableSprints();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedSprintId) {
      loadRetrospectiveData();
    }
  }, [selectedProject, selectedSprintId]);

  const loadAvailableSprints = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);
      
      const sprints = await RetrospectiveService.getAvailableSprints(selectedProject.id);
      setAvailableSprints(sprints);
      
      // Auto-select the most recent sprint
      if (sprints.length > 0) {
        setSelectedSprintId(sprints[sprints.length - 1].id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load available sprints';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadRetrospectiveData = async () => {
    if (!selectedProject || !selectedSprintId) return;

    try {
      setLoading(true);
      setError(null);

      const retrospectiveData = await RetrospectiveService.getSprintRetrospective(
        selectedSprintId,
        selectedProject.id
      );
      
      setInsights(retrospectiveData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load retrospective data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'very positive': return 'green';
      case 'positive': return 'green';
      case 'neutral': return 'yellow';
      case 'needs attention': return 'red';
      default: return 'gray';
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'green';
    if (value >= thresholds.warning) return 'yellow';
    return 'red';
  };

  if (!selectedProject) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view retrospective analytics</Text>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Heading size="lg" color="gray.800">
              Retrospective Analytics
            </Heading>
            <Text color="gray.600">Learn from sprint outcomes and improve processes</Text>
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

        {/* Sprint Selector */}
        <Box p="4" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
          <VStack gap="3" align="stretch">
            <Text fontWeight="semibold" color="gray.700">Select Sprint</Text>
            <select
              value={selectedSprintId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSprintId(Number(e.target.value))}
              disabled={loading || availableSprints.length === 0}
              style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#2d3748'
              }}
            >
              <option value="">Choose a sprint to analyze</option>
              {availableSprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.title}
                </option>
              ))}
            </select>
          </VStack>
        </Box>

        {/* Sprint Overview */}
        {insights && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                Sprint Retrospective: {insights.sprint_title}
              </Heading>
              
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4">
                <Box p="4" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="blue.700">Completion Rate</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getMetricColor(insights.completion_rate, { good: 90, warning: 80 })}.600`}>
                      {insights.completion_rate}%
                    </Text>
                    <Badge colorScheme={getMetricColor(insights.completion_rate, { good: 90, warning: 80 })} variant="subtle">
                      {insights.completion_rate >= 90 ? 'Excellent' : insights.completion_rate >= 80 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </VStack>
                </Box>

                <Box p="4" bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="green.700">Estimation Accuracy</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getMetricColor(insights.estimation_accuracy, { good: 85, warning: 70 })}.600`}>
                      {insights.estimation_accuracy}%
                    </Text>
                    <Badge colorScheme={getMetricColor(insights.estimation_accuracy, { good: 85, warning: 70 })} variant="subtle">
                      {insights.estimation_accuracy >= 85 ? 'Excellent' : insights.estimation_accuracy >= 70 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </VStack>
                </Box>

                <Box p="4" bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                  <VStack gap="2" align="stretch">
                    <Text fontWeight="semibold" color="purple.700">Team Sentiment</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getSentimentColor(insights.team_sentiment)}.600`}>
                      {insights.team_sentiment}
                    </Text>
                    <Badge colorScheme={getSentimentColor(insights.team_sentiment)} variant="subtle">
                      Overall Mood
                    </Badge>
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </Box>
        )}

        {/* What Went Well */}
        {insights && insights.what_went_well.length > 0 && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                What Went Well
              </Heading>
              
              <Box p="4" bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <VStack align="start" gap="2">
                  {insights.what_went_well.map((item, index) => (
                    <HStack key={index} gap="2">
                      <Text color="green.600" fontSize="lg">✓</Text>
                      <Text color="green.700">{item}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {/* What Could Improve */}
        {insights && insights.what_could_improve.length > 0 && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                What Could Improve
              </Heading>
              
              <Box p="4" bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                <VStack align="start" gap="2">
                  {insights.what_could_improve.map((item, index) => (
                    <HStack key={index} gap="2">
                      <Text color="orange.600" fontSize="lg">⚠</Text>
                      <Text color="orange.700">{item}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Action Items */}
        {insights && insights.action_items.length > 0 && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                Action Items for Next Sprint
              </Heading>
              
              <Box p="4" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <VStack align="start" gap="2">
                  {insights.action_items.map((item, index) => (
                    <HStack key={index} gap="2">
                      <Text color="blue.600" fontSize="lg">→</Text>
                      <Text color="blue.700">{item}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Process Improvements */}
        {insights && insights.process_improvements.length > 0 && (
          <Box p="6" bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <Heading size="md" color="gray.700">
                Process Improvements
              </Heading>
              
              <Box p="4" bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                <VStack align="start" gap="2">
                  {insights.process_improvements.map((item, index) => (
                    <HStack key={index} gap="2">
                      <Text color="purple.600" fontSize="lg">🔄</Text>
                      <Text color="purple.700">{item}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
            <VStack gap="4">
              <Spinner size="xl" color="blue.500" />
              <Text>Loading retrospective data...</Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default RetrospectiveAnalytics;
