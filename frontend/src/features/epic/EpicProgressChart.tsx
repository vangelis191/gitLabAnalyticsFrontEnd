import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
} from '@chakra-ui/react';
import GitLabAnalyticsAPI from '../../services/api';

interface EpicProgressData {
  date: string;
  estimated: number;
  actual: number;
}

interface Epic {
  id: number;
  title: string;
  start_date: string;
  due_date: string;
}

const EpicProgressChart: React.FC = () => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
  const [progressData, setProgressData] = useState<EpicProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available epics
  useEffect(() => {
    const fetchEpics = async () => {
      try {
        const epicsData = await GitLabAnalyticsAPI.getEpics();
        setEpics(epicsData);
        if (epicsData.length > 0) {
          setSelectedEpicId(epicsData[0].id);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load epics';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEpics();
  }, []);

  // Fetch progress data when epic is selected
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!selectedEpicId) return;

      try {
        setLoading(true);
        const data = await GitLabAnalyticsAPI.getEpicProgress(selectedEpicId);
        setProgressData(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load progress data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [selectedEpicId]);

  const selectedEpic = epics.find(epic => epic.id === selectedEpicId);

  // Calculate current progress
  const latestData = progressData[progressData.length - 1];
  const currentProgress = latestData ? latestData.actual : 0;
  const estimatedProgress = latestData ? latestData.estimated : 0;
  const isAheadOfSchedule = currentProgress > estimatedProgress;

  if (loading && epics.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack gap="4">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading epics...</Text>
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

  if (epics.length === 0) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">No epics available</Text>
      </Box>
    );
  }

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <Box>
          <Heading size="lg" mb="2">Epic Progress Chart</Heading>
          <Text color="gray.600">Track estimated vs actual progress over time</Text>
        </Box>

        {/* Epic Selector */}
        <Box>
          <Text fontWeight="semibold" mb="2">Select Epic:</Text>
          <select
            value={selectedEpicId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEpicId(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white'
            }}
          >
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.title}
              </option>
            ))}
          </select>
        </Box>

        {/* Current Status */}
        {selectedEpic && latestData && (
          <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <HStack justify="space-between" mb="3">
              <Text fontWeight="semibold" fontSize="lg">{selectedEpic.title}</Text>
              <Badge
                colorScheme={isAheadOfSchedule ? 'green' : 'orange'}
                variant="subtle"
              >
                {isAheadOfSchedule ? 'Ahead of Schedule' : 'Behind Schedule'}
              </Badge>
            </HStack>
            
            <VStack gap="2" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Current Progress:</Text>
                <Text fontWeight="bold" color="blue.600">{currentProgress.toFixed(1)}%</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Estimated Progress:</Text>
                <Text fontWeight="bold" color="green.600">{estimatedProgress.toFixed(1)}%</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Variance:</Text>
                <Text 
                  fontWeight="bold" 
                  color={isAheadOfSchedule ? 'green.600' : 'orange.600'}
                >
                  {(currentProgress - estimatedProgress).toFixed(1)}%
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Progress Chart */}
        {progressData.length > 0 && (
          <>
            {/* Progress Summary */}
            <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200" mb="4">
              <Text fontWeight="semibold" mb="3">Progress Summary</Text>
              <VStack gap="3" align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Average Daily Progress:</Text>
                  <Text fontWeight="bold" color="blue.600">
                    {progressData.length > 1 
                      ? ((progressData[progressData.length - 1].actual - progressData[0].actual) / (progressData.length - 1)).toFixed(1)
                      : '0.0'}% per day
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Months Remaining (at current pace):</Text>
                  <Text fontWeight="bold" color="orange.600">
                    {progressData.length > 1 
                      ? Math.ceil((100 - progressData[progressData.length - 1].actual) / 
                          ((progressData[progressData.length - 1].actual - progressData[0].actual) / (progressData.length - 1)) / 30)
                      : '∞'} months
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Date Range:</Text>
                  <Text fontWeight="bold" color="purple.600">
                    {progressData.length > 0 ? new Date(progressData[0].date).toLocaleDateString() : ''} - {progressData.length > 0 ? new Date(progressData[progressData.length - 1].date).toLocaleDateString() : ''}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Trend:</Text>
                  <Badge
                    colorScheme={isAheadOfSchedule ? 'green' : 'orange'}
                    variant="subtle"
                  >
                    {isAheadOfSchedule ? '📈 Ahead of Schedule' : '📉 Behind Schedule'}
                  </Badge>
                </HStack>
              </VStack>
            </Box>

            {/* Custom SVG Line Chart */}
            <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Text fontWeight="semibold" mb="4">Progress Timeline (Monthly View)</Text>
              
              <Box h="400px" mb="4" position="relative">
                <svg width="100%" height="100%" viewBox="0 0 800 300">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={300 - (y * 300 / 100)}
                      x2="800"
                      y2={300 - (y * 300 / 100)}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Y-axis labels */}
                  {[0, 25, 50, 75, 100].map((y, i) => (
                    <text
                      key={i}
                      x="10"
                      y={300 - (y * 300 / 100) + 5}
                      fontSize="12"
                      fill="#718096"
                    >
                      {y}%
                    </text>
                  ))}
                  
                  {/* X-axis labels */}
                  {progressData.map((d, i) => {
                    if (i % Math.max(1, Math.floor(progressData.length / 8)) === 0) {
                      const date = new Date(d.date);
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                      const day = date.getDate();
                      return (
                        <text
                          key={i}
                          x={50 + (i * 700 / (progressData.length - 1))}
                          y="295"
                          fontSize="12"
                          fill="#718096"
                          textAnchor="middle"
                        >
                          {monthName} {day}
                        </text>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Actual progress line */}
                  <polyline
                    points={progressData.map((d, i) => 
                      `${50 + (i * 700 / (progressData.length - 1))},${300 - (d.actual * 300 / 100)}`
                    ).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Estimated progress line */}
                  <polyline
                    points={progressData.map((d, i) => 
                      `${50 + (i * 700 / (progressData.length - 1))},${300 - (d.estimated * 300 / 100)}`
                    ).join(' ')}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points for actual progress */}
                  {progressData.map((d, i) => (
                    <circle
                      key={`actual-${i}`}
                      cx={50 + (i * 700 / (progressData.length - 1))}
                      cy={300 - (d.actual * 300 / 100)}
                      r="4"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                  
                  {/* Data points for estimated progress */}
                  {progressData.map((d, i) => (
                    <circle
                      key={`estimated-${i}`}
                      cx={50 + (i * 700 / (progressData.length - 1))}
                      cy={300 - (d.estimated * 300 / 100)}
                      r="4"
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
                
                {/* Legend */}
                <Box position="absolute" top="10" right="10" bg="white" p="2" borderRadius="md" boxShadow="sm">
                  <VStack gap="1" align="start">
                    <HStack gap="2">
                      <Box w="3" h="3" bg="#3b82f6" borderRadius="full" />
                      <Text fontSize="sm">Actual Progress</Text>
                    </HStack>
                    <HStack gap="2">
                      <Box w="3" h="3" bg="#22c55e" borderRadius="full" />
                      <Text fontSize="sm">Estimated Progress</Text>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
              
              <Text fontSize="xs" color="gray.500" textAlign="center">
                {progressData.length > 0 
                  ? `${progressData.length} data points from ${new Date(progressData[0].date).toLocaleDateString()} to ${new Date(progressData[progressData.length - 1].date).toLocaleDateString()}`
                  : 'No progress data available'
                }
              </Text>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default EpicProgressChart; 