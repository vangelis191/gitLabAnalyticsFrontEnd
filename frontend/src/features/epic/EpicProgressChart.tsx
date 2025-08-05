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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import GitLabAnalyticsAPI, { type EpicStatus } from '../../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [epicStatus, setEpicStatus] = useState<EpicStatus | null>(null);
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
        const [data, allEpicStatus] = await Promise.all([
          GitLabAnalyticsAPI.getEpicProgress(selectedEpicId),
          GitLabAnalyticsAPI.getEpicStatus()
        ]);
        
        setProgressData(data);
        // Find the specific epic status by ID
        const epicData = allEpicStatus.find(epic => epic.epic_id === selectedEpicId);
        if (epicData) {
          setEpicStatus(epicData);
        }
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

  // Function to get milestone color based on index
  const getMilestoneColor = (index: number) => {
    const colors = ['rgba(255, 99, 132, 0.1)', 'rgba(54, 162, 235, 0.1)', 'rgba(255, 205, 86, 0.1)', 'rgba(75, 192, 192, 0.1)', 'rgba(153, 102, 255, 0.1)'];
    return colors[index % colors.length];
  };

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

            {/* Chart.js Line Chart */}
            <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Text fontWeight="semibold" mb="4">Progress Timeline (Monthly View)</Text>
              
              <Box h="400px" mb="4">
                <Line
                  data={{
                    labels: progressData.map(d => {
                      const date = new Date(d.date);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }),
                    datasets: [
                      {
                        label: 'Actual Progress',
                        data: progressData.map(d => d.actual),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      },
                      {
                        label: 'Estimated Progress',
                        data: progressData.map(d => d.estimated),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      intersect: false,
                      mode: 'index' as const,
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Epic Progress: Estimated vs Actual',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            return `${label}: ${context.parsed.y.toFixed(1)}%`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Progress (%)',
                        },
                        ticks: {
                          callback: function(value) {
                            return typeof value === 'number' ? value + '%' : value;
                          },
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Timeline (Months)',
                        },
                      },
                    },
                  }}
                />
              </Box>
              
              {/* Milestone Legend */}
              {epicStatus?.milestones && epicStatus.milestones.length > 0 && (
                <Box mt="4" p="3" bg="gray.50" borderRadius="md">
                  <Text fontWeight="semibold" mb="2" fontSize="sm">Milestones:</Text>
                  <VStack gap="1" align="start">
                    {epicStatus.milestones.map((milestone, index) => (
                      <HStack key={milestone.milestone_id} gap="2">
                        <Box 
                          w="3" 
                          h="3" 
                          bg={getMilestoneColor(index)} 
                          borderRadius="full"
                          border="1px solid"
                          borderColor="gray.300"
                        />
                        <Text fontSize="xs">
                          {milestone.title} ({milestone.progress_percent.toFixed(1)}%)
                        </Text>
                        <Badge 
                          size="xs" 
                          colorScheme={milestone.successful ? 'green' : 'orange'}
                        >
                          {milestone.successful ? '✅' : '⏳'}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
              
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