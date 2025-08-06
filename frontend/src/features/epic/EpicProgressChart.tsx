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
import GitLabAnalyticsAPI, { type EpicStatus, type ProjectEpic } from '../../services/api';
import { useProject } from '../../hooks/useProject';

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

// Using ProjectEpic from API service instead of local Epic interface

const EpicProgressChart: React.FC = () => {
  const { selectedProject } = useProject();
  const [epics, setEpics] = useState<ProjectEpic[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
  const [progressData, setProgressData] = useState<EpicProgressData[]>([]);
  const [epicStatus, setEpicStatus] = useState<EpicStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available epics
  useEffect(() => {
    const fetchEpics = async () => {
      try {
        if (!selectedProject) return;
        
        const epicsData = await GitLabAnalyticsAPI.getProjectEpics(selectedProject.id);
        setEpics(epicsData);
        console.log('Epics for project', selectedProject.id, ':', epicsData);
        
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

    if (selectedProject) {
      fetchEpics();
    }
  }, [selectedProject]);

  // Fetch progress data when epic is selected
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!selectedEpicId) return;

      try {
        setLoading(true);
        const [data, allEpicStatus] = await Promise.all([
          GitLabAnalyticsAPI.getEpicProgress(selectedEpicId, selectedProject?.id),
          GitLabAnalyticsAPI.getEpicStatus(selectedProject?.id)
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

    if (selectedProject && selectedEpicId) {
      fetchProgressData();
    }
  }, [selectedEpicId, selectedProject]);

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

  if (!selectedProject) {
    return (
      <Box p="6" bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view epic progress data</Text>
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
        <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
          <VStack gap="4" align="stretch">
            <Box>
              <Text fontWeight="semibold" mb="2" fontSize="lg">📋 Epic Selection</Text>
              <Text fontSize="sm" color="gray.600">Choose an epic from the selected project to view detailed progress</Text>
            </Box>
            
            <Box>
              <Text fontWeight="medium" mb="2">Select Epic:</Text>
              <select
                value={selectedEpicId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEpicId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <option value="">-- Select an Epic --</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </Box>

            {/* Epic Details */}
            {selectedEpic && (
              <Box p="4" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <VStack gap="3" align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="lg" color="blue.800">{selectedEpic.title}</Text>
                    <Badge colorScheme="blue" variant="solid">Epic #{selectedEpic.id}</Badge>
                  </HStack>
                  
                  <HStack gap="6" wrap="wrap">
                    <VStack align="start" gap="1">
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">Start Date:</Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {selectedEpic.start_date ? new Date(selectedEpic.start_date).toLocaleDateString() : 'Not set'}
                      </Text>
                    </VStack>
                    
                    <VStack align="start" gap="1">
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">Due Date:</Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {selectedEpic.due_date ? new Date(selectedEpic.due_date).toLocaleDateString() : 'Not set'}
                      </Text>
                    </VStack>
                    
                    <VStack align="start" gap="1">
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">Milestones:</Text>
                      <Text fontSize="sm" fontWeight="semibold">{selectedEpic.milestone_count || 0}</Text>
                    </VStack>
                    
                    <VStack align="start" gap="1">
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">Duration:</Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {selectedEpic.start_date && selectedEpic.due_date 
                          ? Math.ceil((new Date(selectedEpic.due_date).getTime() - new Date(selectedEpic.start_date).getTime()) / (1000 * 60 * 60 * 24))
                          : 'N/A'} days
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {/* Debug Info */}
                  {/* <Box p="2" bg="yellow.50" borderRadius="md" fontSize="xs">
                    <Text fontWeight="semibold" color="orange.700">Debug Info:</Text>
                    <Text>Start Date Raw: {selectedEpic.start_date || 'null'}</Text>
                    <Text>Due Date Raw: {selectedEpic.due_date || 'null'}</Text>
                    <Text>Epic Data: {JSON.stringify(selectedEpic, null, 2)}</Text>
                  </Box> */}
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Current Status */}
        {selectedEpic && latestData && (
          <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <VStack gap="4" align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="xl">📊 Progress Status</Text>
                <Badge
                  colorScheme={isAheadOfSchedule ? 'green' : 'orange'}
                  variant="solid"
                  fontSize="sm"
                  px="3"
                  py="1"
                >
                  {isAheadOfSchedule ? '🚀 Ahead of Schedule' : '⚠️ Behind Schedule'}
                </Badge>
              </HStack>
              
              <Box>
                <Text fontWeight="semibold" mb="3" color="gray.700">Progress Metrics</Text>
                <VStack gap="3" align="stretch">
                  <HStack justify="space-between" p="3" bg="blue.50" borderRadius="md">
                    <HStack gap="2">
                      <Text fontSize="lg">📈</Text>
                      <Text fontSize="sm" color="gray.600">Current Progress:</Text>
                    </HStack>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">{currentProgress?.toFixed(1) || '0.0'}%</Text>
                  </HStack>
                  
                  <HStack justify="space-between" p="3" bg="green.50" borderRadius="md">
                    <HStack gap="2">
                      <Text fontSize="lg">🎯</Text>
                      <Text fontSize="sm" color="gray.600">Estimated Progress:</Text>
                    </HStack>
                    <Text fontWeight="bold" fontSize="lg" color="green.600">{estimatedProgress?.toFixed(1) || '0.0'}%</Text>
                  </HStack>
                  
                  <HStack justify="space-between" p="3" bg={isAheadOfSchedule ? "green.50" : "orange.50"} borderRadius="md">
                    <HStack gap="2">
                      <Text fontSize="lg">{isAheadOfSchedule ? "✅" : "❌"}</Text>
                      <Text fontSize="sm" color="gray.600">Variance:</Text>
                    </HStack>
                    <Text 
                      fontWeight="bold" 
                      fontSize="lg"
                      color={isAheadOfSchedule ? 'green.600' : 'orange.600'}
                    >
                      {((currentProgress || 0) - (estimatedProgress || 0)).toFixed(1)}%
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Additional Epic Details */}
              {epicStatus && (
                <Box p="3" bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                  <Text fontWeight="semibold" mb="2" color="purple.700">📋 Epic Details</Text>
                  <VStack gap="2" align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Status:</Text>
                      <Badge 
                        colorScheme={epicStatus.successful ? 'green' : 'orange'} 
                        variant="subtle"
                      >
                        {epicStatus.successful ? '✅ Successful' : '⏳ In Progress'}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Total Milestones:</Text>
                      <Text fontWeight="semibold">{epicStatus.milestones?.length || 0}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Completed Milestones:</Text>
                      <Text fontWeight="semibold">
                        {epicStatus.milestones?.filter(m => m.successful).length || 0}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        )}

        {/* Progress Chart */}
        {selectedEpic && (
          <>
            {/* Progress Summary */}
            {progressData.length > 0 ? (
              <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200" mb="4">
                <Text fontWeight="semibold" mb="3">Progress Summary</Text>
                <VStack gap="3" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Average Daily Progress:</Text>
                    <Text fontWeight="bold" color="blue.600">
                      {progressData.length > 1 
                        ? (((progressData[progressData.length - 1]?.actual || 0) - (progressData[0]?.actual || 0)) / (progressData.length - 1)).toFixed(1)
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
            ) : (
              <Box p="4" bg="yellow.50" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="yellow.200" mb="4">
                <VStack gap="2">
                  <Text fontWeight="semibold" color="yellow.700">📊 Progress Summary</Text>
                  <Text fontSize="sm" color="yellow.600" textAlign="center">
                    Progress data is not available for this epic yet.<br/>
                    Summary will appear once progress data is loaded.
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Chart.js Line Chart */}
            <Box p="4" bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Text fontWeight="semibold" mb="4">Progress Timeline (Monthly View)</Text>
              
                            {progressData.length > 0 ? (
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
              ) : (
                <Box h="200px" display="flex" justifyContent="center" alignItems="center" bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <VStack gap="3">
                    <Text fontSize="lg" fontWeight="semibold" color="gray.600">📊 No Progress Data Available</Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Progress data for this epic is not available yet.<br/>
                      The chart will appear once progress data is loaded.
                    </Text>
                  </VStack>
                </Box>
              )}
              
              {/* Milestone Legend */}
              {epicStatus?.milestones && epicStatus.milestones.length > 0 && (
                <Box mt="4" p="4" bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <VStack gap="3" align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="lg">🎯 Milestones Overview</Text>
                      <Badge colorScheme="blue" variant="solid">
                        {epicStatus.milestones.length} Total
                      </Badge>
                    </HStack>
                    
                    <Box>
                      <Text fontWeight="semibold" mb="2" color="gray.700">Milestone Details</Text>
                      <VStack gap="2" align="stretch">
                        {epicStatus.milestones.map((milestone, index) => (
                          <Box 
                            key={milestone.milestone_id} 
                            p="3" 
                            bg="white" 
                            borderRadius="md" 
                            border="1px solid" 
                            borderColor={milestone.successful ? "green.200" : "orange.200"}
                            boxShadow="sm"
                          >
                            <HStack justify="space-between" mb="2">
                              <HStack gap="2">
                                <Box 
                                  w="4" 
                                  h="4" 
                                  bg={getMilestoneColor(index)} 
                                  borderRadius="full"
                                  border="2px solid"
                                  borderColor="gray.300"
                                />
                                <Text fontWeight="semibold" fontSize="sm">
                                  {milestone.title}
                                </Text>
                              </HStack>
                              <Badge 
                                size="sm" 
                                colorScheme={milestone.successful ? 'green' : 'orange'}
                                variant="solid"
                              >
                                {milestone.successful ? '✅ Completed' : '⏳ In Progress'}
                              </Badge>
                            </HStack>
                            
                            <HStack gap="4" wrap="wrap">
                              <VStack align="start" gap="1">
                                <Text fontSize="xs" color="gray.600">Progress:</Text>
                                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                  {milestone.progress_percent?.toFixed(1) || '0.0'}%
                                </Text>
                              </VStack>
                              
                              <VStack align="start" gap="1">
                                <Text fontSize="xs" color="gray.600">Total Issues:</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                  {milestone.total_issues}
                                </Text>
                              </VStack>
                              
                              <VStack align="start" gap="1">
                                <Text fontSize="xs" color="gray.600">Closed Issues:</Text>
                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                  {milestone.closed_issues}
                                </Text>
                              </VStack>
                              
                              <VStack align="start" gap="1">
                                <Text fontSize="xs" color="gray.600">Completion Rate:</Text>
                                <Text fontSize="sm" fontWeight="bold" color="purple.600">
                                  {milestone.total_issues > 0 
                                    ? ((milestone.closed_issues / milestone.total_issues) * 100).toFixed(1)
                                    : '0.0'}%
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                    
                    {/* Milestone Summary */}
                    <Box p="3" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="semibold" color="blue.700">Summary:</Text>
                        <Text fontSize="sm" color="blue.600">
                          {epicStatus.milestones.filter(m => m.successful).length} of {epicStatus.milestones.length} completed
                        </Text>
                      </HStack>
                    </Box>
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