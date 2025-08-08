import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Spinner,
  Button,
} from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import GitLabAnalyticsAPI, { type TeamDashboard as TeamDashboardData, type DeveloperSummary, type TeamCapacity } from '../../services/api';
import { useProject } from '../../hooks/useProject';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TeamDashboard: React.FC = () => {
  const { selectedProject } = useProject();
  const [data, setData] = useState<TeamDashboardData | null>(null);
  const [developerSummary, setDeveloperSummary] = useState<DeveloperSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<TeamCapacity | null>(null);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team dashboard data and developer summary
        const [teamData, summaryData] = await Promise.all([
          GitLabAnalyticsAPI.getTeamDashboard(selectedProject?.id),
          GitLabAnalyticsAPI.getDeveloperSummary(selectedProject?.id)
        ]);
        
        setData(teamData);
        setDeveloperSummary(summaryData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load team data';
        console.error('Error fetching team data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProject) {
      fetchTeamData();
    }
  }, [selectedProject]);

  const handleDeveloperClick = (developer: DeveloperSummary) => {
    // Find the corresponding team capacity data for this developer
    const teamCapacityData = data?.team_capacity.find(
      member => member.team_member === developer.developer
    );
    
    if (teamCapacityData) {
      setSelectedDeveloper(teamCapacityData);
      setShowDeveloperModal(true);
    }
  };

  const DeveloperDetailModal = () => {
    if (!selectedDeveloper || !showDeveloperModal) return null;

    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0,0,0,0.5)"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box p={6} bg="white" borderRadius="lg" maxW="800px" w="full" mx={4} maxH="90vh" overflowY="auto">
          <VStack gap={6} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
              <HStack>
                <Heading size="md">{selectedDeveloper.team_member}</Heading>
                <Badge
                  colorScheme={selectedDeveloper.estimation_accuracy_percent >= 90 ? 'green' : 'orange'}
                  variant="subtle"
                >
                  {selectedDeveloper.estimation_accuracy_percent.toFixed(1)}% Accuracy
                </Badge>
              </HStack>
              <Button variant="ghost" onClick={() => setShowDeveloperModal(false)} size="sm">
                ✕
              </Button>
            </HStack>

            {/* Performance Overview */}
            <Box>
              <Heading size="md" mb={4}>Performance Overview</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.600" fontWeight="semibold">Total Issues</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.700">{selectedDeveloper.total_issues}</Text>
                  <Text fontSize="xs" color="blue.500">Assigned tasks</Text>
                </Box>
                <Box p={4} bg="green.50" borderRadius="md">
                  <Text fontSize="sm" color="green.600" fontWeight="semibold">Closed Issues</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.700">{selectedDeveloper.closed_issues}</Text>
                  <Text fontSize="xs" color="green.500">Completed tasks</Text>
                </Box>
                <Box p={4} bg="orange.50" borderRadius="md">
                  <Text fontSize="sm" color="orange.600" fontWeight="semibold">Velocity</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.700">{selectedDeveloper.velocity_hours?.toFixed(1) || '0.0'}h</Text>
                  <Text fontSize="xs" color="orange.500">Hours per sprint</Text>
                </Box>
                <Box p={4} bg="purple.50" borderRadius="md">
                  <Text fontSize="sm" color="purple.600" fontWeight="semibold">Completion Rate</Text>
                  <Text fontSize="2xl" fontWeight="bold" color={(selectedDeveloper.completion_rate || 0) >= 80 ? 'green.500' : 'orange.500'}>
                    {selectedDeveloper.completion_rate?.toFixed(1) || '0.0'}%
                  </Text>
                  <Text fontSize="xs" color="purple.500">Task completion</Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Time Analysis */}
            <Box>
              <Heading size="md" mb={4}>Time Analysis</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                <Box p={4} bg="teal.50" borderRadius="md">
                  <Text fontSize="sm" color="teal.600" fontWeight="semibold">Estimated Hours</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="teal.700">{selectedDeveloper.total_estimated_hours?.toFixed(1) || '0.0'}h</Text>
                  <Text fontSize="xs" color="teal.500">Initial estimates</Text>
                </Box>
                <Box p={4} bg="red.50" borderRadius="md">
                  <Text fontSize="sm" color="red.600" fontWeight="semibold">Spent Hours</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="red.700">{selectedDeveloper.total_spent_hours?.toFixed(1) || '0.0'}h</Text>
                  <Text fontSize="xs" color="red.500">Actual time spent</Text>
                </Box>
                <Box p={4} bg="cyan.50" borderRadius="md">
                  <Text fontSize="sm" color="cyan.600" fontWeight="semibold">Avg Hours per Issue</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="cyan.700">{selectedDeveloper.avg_hours_per_issue?.toFixed(1) || '0.0'}h</Text>
                  <Text fontSize="xs" color="cyan.500">Average task duration</Text>
                </Box>
                <Box p={4} bg="pink.50" borderRadius="md">
                  <Text fontSize="sm" color="pink.600" fontWeight="semibold">Estimation Accuracy</Text>
                  <Text fontSize="2xl" fontWeight="bold" color={selectedDeveloper.estimation_accuracy_percent >= 90 ? 'green.500' : 'orange.500'}>
                    {selectedDeveloper.estimation_accuracy_percent?.toFixed(1) || '0.0'}%
                  </Text>
                  <Text fontSize="xs" color="pink.500">Estimate vs actual</Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Key Metrics */}
            <Box>
              <Heading size="md" mb={4}>Key Metrics</Heading>
              <VStack gap={3} align="stretch">
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.600" fontWeight="semibold">Productivity Score</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                    {((selectedDeveloper.completion_rate || 0) * (selectedDeveloper.estimation_accuracy_percent || 0) / 100).toFixed(1)}%
                  </Text>
                  <Text fontSize="xs" color="blue.500">Completion rate × Accuracy</Text>
                </Box>
                
                <Box p={4} bg="green.50" borderRadius="md">
                  <Text fontSize="sm" color="green.600" fontWeight="semibold">Efficiency Ratio</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.700">
                    {selectedDeveloper.total_estimated_hours && selectedDeveloper.total_spent_hours 
                      ? (selectedDeveloper.total_estimated_hours / selectedDeveloper.total_spent_hours).toFixed(2)
                      : '0.00'}
                  </Text>
                  <Text fontSize="xs" color="green.500">Estimated ÷ Spent hours</Text>
                </Box>
                
                <Box p={4} bg="purple.50" borderRadius="md">
                  <Text fontSize="sm" color="purple.600" fontWeight="semibold">Workload Distribution</Text>
                  <Text fontSize="lg" fontWeight="bold" color="purple.700">
                    {selectedDeveloper.total_issues > 0 
                      ? ((selectedDeveloper.closed_issues / selectedDeveloper.total_issues) * 100).toFixed(1)
                      : '0.0'}% Complete
                  </Text>
                  <Text fontSize="xs" color="purple.500">{selectedDeveloper.closed_issues} of {selectedDeveloper.total_issues} tasks</Text>
                </Box>
              </VStack>
            </Box>

            {/* Footer */}
            <HStack justify="flex-end" pt={4}>
              <Button colorScheme="blue" onClick={() => setShowDeveloperModal(false)}>
                Close
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  };

  if (!selectedProject) {
    return (
      <Box p={6} bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
        <Text color="yellow.600">Please select a project to view team data</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading team data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
        <Text color="red.800" fontWeight="semibold">Error!</Text>
        <Text color="red.700">{error}</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
        <Text color="blue.800" fontWeight="semibold">No Data</Text>
        <Text color="blue.700">No team data available.</Text>
      </Box>
    );
  }

  const { team_capacity, lead_time_summary, throughput_summary } = data;

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Team Dashboard</Heading>
          <Text color="gray.600">Team capacity, performance, and productivity metrics</Text>
        </Box>

        {/* Lead Time Summary */}
        <Box>
          <Heading size="md" mb={4}>Lead Time Analysis</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Average Lead Time</Text>
              <Text fontSize="2xl" fontWeight="bold">{lead_time_summary.average_lead_time_days.toFixed(1)} days</Text>
              <Text fontSize="xs" color="orange.500">↓ From creation to completion</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Issues Analyzed</Text>
              <Text fontSize="2xl" fontWeight="bold">{lead_time_summary.total_issues_analyzed}</Text>
              <Text fontSize="xs" color="green.500">↑ Total issues in analysis</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Throughput Summary */}
        <Box>
          <Heading size="md" mb={4}>Throughput Analysis</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Total Issues Completed</Text>
              <Text fontSize="2xl" fontWeight="bold">{throughput_summary.total_issues_completed}</Text>
              <Text fontSize="xs" color="green.500">↑ In analysis period</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Daily Throughput</Text>
              <Text fontSize="2xl" fontWeight="bold">{throughput_summary.average_daily_throughput.toFixed(2)}</Text>
              <Text fontSize="xs" color="green.500">↑ Issues per day</Text>
            </Box>

            <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Text fontSize="sm" color="gray.500">Weekly Throughput</Text>
              <Text fontSize="2xl" fontWeight="bold">{throughput_summary.average_weekly_throughput.toFixed(1)}</Text>
              <Text fontSize="xs" color="green.500">↑ Issues per week</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Team Capacity List */}
        {team_capacity.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Team Capacity Analysis</Heading>
            <VStack gap={3} align="stretch">
              {team_capacity.map((member) => (
                <Box key={member.team_member} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" fontSize="lg">{member.team_member}</Text>
                    <Badge
                      colorScheme={member.estimation_accuracy_percent >= 90 ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {member.estimation_accuracy_percent.toFixed(1)}% Accuracy
                    </Badge>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Total Issues</Text>
                      <Text fontWeight="bold">{member.total_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Closed Issues</Text>
                      <Text fontWeight="bold">{member.closed_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Velocity</Text>
                      <Text fontWeight="bold">{member.velocity_hours?.toFixed(1) || '0.0'}h</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Completion Rate</Text>
                      <Text fontWeight="bold" color={(member.completion_rate || 0) >= 80 ? 'green.500' : 'orange.500'}>
                        {member.completion_rate?.toFixed(1) || '0.0'}%
                      </Text>
                    </Box>
                  </SimpleGrid>
                  
                  <HStack gap={4} mt={2}>
                    <Text fontSize="sm" color="gray.600">
                      Estimated: {member.total_estimated_hours?.toFixed(1) || '0.0'}h
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Spent: {member.total_spent_hours?.toFixed(1) || '0.0'}h
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Developer Summary */}
        {developerSummary.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Developer Performance Summary</Heading>
            <VStack gap={3} align="stretch">
              {developerSummary.map((dev) => (
                <Box 
                  key={dev.developer} 
                  p={4} 
                  bg="white" 
                  borderRadius="lg" 
                  boxShadow="sm"
                  cursor="pointer"
                  _hover={{
                    boxShadow: "md",
                    transform: "translateY(-1px)",
                    transition: "all 0.2s"
                  }}
                  onClick={() => handleDeveloperClick(dev)}
                >
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" fontSize="lg">{dev.developer}</Text>
                    <Badge
                      colorScheme={dev.successful ? 'green' : 'orange'}
                      variant="subtle"
                    >
                      {dev.successful ? 'On Track' : 'Needs Attention'}
                    </Badge>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Total Issues</Text>
                      <Text fontWeight="bold">{dev.total_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Closed Issues</Text>
                      <Text fontWeight="bold">{dev.closed_issues}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Progress</Text>
                      <Text fontWeight="bold" color={(dev.progress_percent || 0) >= 80 ? 'green.500' : 'orange.500'}>
                        {dev.progress_percent?.toFixed(1) || '0.0'}%
                      </Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Text fontSize="xs" color="blue.500" mt={2} textAlign="center">
                    Click for detailed performance metrics →
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Team Performance Charts */}
        {team_capacity.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Team Performance Analytics</Heading>
            
            {/* Team Capacity Bar Chart */}
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" mb={6}>
              <Heading size="sm" mb={4}>Team Capacity Overview</Heading>
              <Box h="400px">
                <Bar
                  data={{
                    labels: team_capacity.map(member => member.team_member),
                    datasets: [
                      {
                        label: 'Total Issues',
                        data: team_capacity.map(member => member.total_issues),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Closed Issues',
                        data: team_capacity.map(member => member.closed_issues),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Team Issues Distribution',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Issues',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Team Members',
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Velocity and Hours Line Chart */}
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" mb={6}>
              <Heading size="sm" mb={4}>Velocity & Time Analysis</Heading>
              <Box h="400px">
                <Line
                  data={{
                    labels: team_capacity.map(member => member.team_member),
                    datasets: [
                      {
                        label: 'Velocity (Hours)',
                        data: team_capacity.map(member => member.velocity_hours || 0),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      },
                      {
                        label: 'Estimated Hours',
                        data: team_capacity.map(member => member.total_estimated_hours || 0),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      },
                      {
                        label: 'Spent Hours',
                        data: team_capacity.map(member => member.total_spent_hours || 0),
                        borderColor: 'rgb(255, 205, 86)',
                        backgroundColor: 'rgba(255, 205, 86, 0.1)',
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
                        text: 'Team Velocity & Time Tracking',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            return `${label}: ${context.parsed.y.toFixed(1)}h`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Hours',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Team Members',
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Performance Metrics Doughnut Chart */}
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" mb={6}>
              <Heading size="sm" mb={4}>Completion Rate Distribution</Heading>
              <Box h="400px">
                <Doughnut
                  data={{
                    labels: team_capacity.map(member => member.team_member),
                    datasets: [
                      {
                        data: team_capacity.map(member => member.completion_rate || 0),
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(251, 146, 60, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(6, 182, 212, 0.8)',
                        ],
                        borderColor: [
                          'rgb(34, 197, 94)',
                          'rgb(59, 130, 246)',
                          'rgb(251, 146, 60)',
                          'rgb(239, 68, 68)',
                          'rgb(168, 85, 247)',
                          'rgb(6, 182, 212)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                      },
                      title: {
                        display: true,
                        text: 'Team Completion Rates',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.parsed.toFixed(1)}%`;
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Estimation Accuracy Chart */}
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
              <Heading size="sm" mb={4}>Estimation Accuracy</Heading>
              <Box h="400px">
                <Bar
                  data={{
                    labels: team_capacity.map(member => member.team_member),
                    datasets: [
                      {
                        label: 'Estimation Accuracy (%)',
                        data: team_capacity.map(member => member.estimation_accuracy_percent || 0),
                        backgroundColor: team_capacity.map(member => 
                          (member.estimation_accuracy_percent || 0) >= 90 
                            ? 'rgba(34, 197, 94, 0.8)' 
                            : (member.estimation_accuracy_percent || 0) >= 70 
                              ? 'rgba(251, 146, 60, 0.8)' 
                              : 'rgba(239, 68, 68, 0.8)'
                        ),
                        borderColor: team_capacity.map(member => 
                          (member.estimation_accuracy_percent || 0) >= 90 
                            ? 'rgb(34, 197, 94)' 
                            : (member.estimation_accuracy_percent || 0) >= 70 
                              ? 'rgb(251, 146, 60)' 
                              : 'rgb(239, 68, 68)'
                        ),
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: true,
                        text: 'Team Estimation Accuracy',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Accuracy: ${context.parsed.y.toFixed(1)}%`;
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
                          text: 'Accuracy (%)',
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
                          text: 'Team Members',
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </VStack>
      
      {/* Developer Detail Modal */}
      <DeveloperDetailModal />
    </Box>
  );
};

export default TeamDashboard; 