import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
} from '@chakra-ui/react';
import { FiClock, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
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
import GitLabAnalyticsAPI from '../../services/api';
import type { LeadTimeAnalysis } from '../../services/api';
import { useProject } from '../../hooks/useProject';

// Define issue type for lead time analysis
interface LeadTimeIssue {
  id: number;
  title?: string;
  lead_time_days: number;
  created_at: string;
  completed_at: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LeadTimeAnalytics: React.FC = () => {
  const [leadTimeData, setLeadTimeData] = useState<LeadTimeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedProject } = useProject();

  const loadLeadTimeData = useCallback(async () => {
    try {
      setLoading(true);
      const data = selectedProject 
        ? await GitLabAnalyticsAPI.getProjectLeadTime(selectedProject.id)
        : await GitLabAnalyticsAPI.getLeadTimeAnalysis();
      setLeadTimeData(data);
    } catch (error) {
      console.error('Error loading lead time data:', error);
      alert('Failed to fetch lead time analysis');
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadLeadTimeData();
  }, [loadLeadTimeData]);

  const getPerformanceBadge = (avgLeadTime: number) => {
    if (avgLeadTime <= 3) return { color: 'green', text: 'Excellent', icon: FiTrendingUp };
    if (avgLeadTime <= 7) return { color: 'blue', text: 'Good', icon: FiMinus };
    if (avgLeadTime <= 14) return { color: 'orange', text: 'Needs Improvement', icon: FiTrendingDown };
    return { color: 'red', text: 'Poor', icon: FiTrendingDown };
  };

  const chartData = leadTimeData ? {
    labels: leadTimeData.issues.map((_, index: number) => `Issue ${index + 1}`),
    datasets: [
      {
        label: 'Lead Time (days)',
        data: leadTimeData.issues.map((issue) => (issue as LeadTimeIssue).lead_time_days),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Average Lead Time',
        data: Array(leadTimeData.issues.length).fill(leadTimeData.average_lead_time_days),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Lead Time Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Days',
        },
      },
    },
  };

  if (loading) {
    return (
      <Box p={6}>
        <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="gray.200">
          <Text textAlign="center">Loading lead time analytics...</Text>
        </Box>
      </Box>
    );
  }

  if (!leadTimeData) {
    return (
      <Box p={6}>
        <Box bg="blue.50" p={4} borderRadius="md" border="1px solid" borderColor="blue.200">
          <Text color="blue.700">No lead time data available. Issues need to be completed to calculate lead times.</Text>
        </Box>
      </Box>
    );
  }

  const performance = getPerformanceBadge(leadTimeData.average_lead_time_days);

  return (
    <Box p={6}>
      <VStack gap={6} alignItems="stretch">
        {/* Header */}
        <HStack gap={3}>
          <FiClock size={24} />
          <Heading size="lg">Lead Time Analytics</Heading>
          <Badge colorScheme={performance.color} fontSize="sm">
            {performance.text}
          </Badge>
        </HStack>

        {/* Key Metrics */}
        <HStack gap={6} alignItems="stretch">
          <Box bg="white" p={4} borderRadius="md" border="1px solid" borderColor="gray.200" flex={1}>
            <Text fontSize="sm" color="gray.600" mb={1}>Average Lead Time</Text>
            <Text fontSize="2xl" fontWeight="bold" mb={1}>{leadTimeData.average_lead_time_days.toFixed(1)} days</Text>
            <HStack gap={1} fontSize="sm" color="gray.500">
              <performance.icon />
              <Text>Time from creation to completion</Text>
            </HStack>
          </Box>

          <Box bg="white" p={4} borderRadius="md" border="1px solid" borderColor="gray.200" flex={1}>
            <Text fontSize="sm" color="gray.600" mb={1}>Median Lead Time</Text>
            <Text fontSize="2xl" fontWeight="bold" mb={1}>{leadTimeData.median_lead_time_days.toFixed(1)} days</Text>
            <Text fontSize="sm" color="gray.500">50th percentile</Text>
          </Box>

          <Box bg="white" p={4} borderRadius="md" border="1px solid" borderColor="gray.200" flex={1}>
            <Text fontSize="sm" color="gray.600" mb={1}>Standard Deviation</Text>
            <Text fontSize="2xl" fontWeight="bold" mb={1}>{leadTimeData.lead_time_std_dev.toFixed(1)} days</Text>
            <Text fontSize="sm" color="gray.500">Consistency measure</Text>
          </Box>

          <Box bg="white" p={4} borderRadius="md" border="1px solid" borderColor="gray.200" flex={1}>
            <Text fontSize="sm" color="gray.600" mb={1}>Issues Analyzed</Text>
            <Text fontSize="2xl" fontWeight="bold" mb={1}>{leadTimeData.total_issues_analyzed}</Text>
            <Text fontSize="sm" color="gray.500">Completed issues only</Text>
          </Box>
        </HStack>

        {/* Range Information */}
        <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="gray.200">
          <Heading size="md" mb={4}>Lead Time Range</Heading>
          <HStack gap={8} justifyContent="space-around">
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {leadTimeData.min_lead_time_days}
              </Text>
              <Text fontSize="sm" color="gray.600">Minimum (days)</Text>
            </VStack>
            
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {leadTimeData.average_lead_time_days.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.600">Average (days)</Text>
            </VStack>
            
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {leadTimeData.median_lead_time_days.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.600">Median (days)</Text>
            </VStack>
            
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {leadTimeData.max_lead_time_days}
              </Text>
              <Text fontSize="sm" color="gray.600">Maximum (days)</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Lead Time Distribution Chart */}
        {chartData && (
          <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="gray.200">
            <Heading size="md" mb={4}>Lead Time Distribution</Heading>
            <Box h="400px">
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
        )}

        {/* Performance Insights */}
        <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="gray.200">
          <Heading size="md" mb={4}>Performance Insights</Heading>
          <VStack gap={4} alignItems="stretch">
            {leadTimeData.average_lead_time_days <= 3 && (
              <Box bg="green.50" p={4} borderRadius="md" border="1px solid" borderColor="green.200">
                <VStack alignItems="start" gap={1}>
                  <Text fontWeight="bold" color="green.700">Excellent Lead Time Performance</Text>
                  <Text fontSize="sm" color="green.600">
                    Your team is delivering issues very quickly with an average of {leadTimeData.average_lead_time_days.toFixed(1)} days.
                  </Text>
                </VStack>
              </Box>
            )}

            {leadTimeData.average_lead_time_days > 3 && leadTimeData.average_lead_time_days <= 7 && (
              <Box bg="blue.50" p={4} borderRadius="md" border="1px solid" borderColor="blue.200">
                <VStack alignItems="start" gap={1}>
                  <Text fontWeight="bold" color="blue.700">Good Lead Time Performance</Text>
                  <Text fontSize="sm" color="blue.600">
                    Your team has solid delivery times. Consider optimizing processes to reduce to under 3 days.
                  </Text>
                </VStack>
              </Box>
            )}

            {leadTimeData.average_lead_time_days > 7 && (
              <Box bg="orange.50" p={4} borderRadius="md" border="1px solid" borderColor="orange.200">
                <VStack alignItems="start" gap={1}>
                  <Text fontWeight="bold" color="orange.700">Lead Time Needs Improvement</Text>
                  <Text fontSize="sm" color="orange.600">
                    Consider breaking down large issues, reducing WIP, or identifying bottlenecks in your process.
                  </Text>
                </VStack>
              </Box>
            )}

            {leadTimeData.lead_time_std_dev > leadTimeData.average_lead_time_days && (
              <Box bg="orange.50" p={4} borderRadius="md" border="1px solid" borderColor="orange.200">
                <VStack alignItems="start" gap={1}>
                  <Text fontWeight="bold" color="orange.700">High Variability Detected</Text>
                  <Text fontSize="sm" color="orange.600">
                    Lead times are inconsistent (std dev: {leadTimeData.lead_time_std_dev.toFixed(1)} days). 
                    Focus on standardizing processes and issue sizing.
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Recent Issues Sample */}
        {leadTimeData.issues.length > 0 && (
          <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="gray.200">
            <Heading size="md" mb={4}>Recent Issues Sample</Heading>
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Issue</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Lead Time</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Performance</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Created</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {leadTimeData.issues.slice(0, 10).map((issue, index: number) => {
                    const typedIssue = issue as LeadTimeIssue;
                    const issuePerformance = getPerformanceBadge(typedIssue.lead_time_days);
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #f7fafc' }}>
                        <td style={{ padding: '8px' }}>
                          <Text fontWeight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {typedIssue.title || `Issue #${typedIssue.id}`}
                          </Text>
                        </td>
                        <td style={{ padding: '8px' }}>{typedIssue.lead_time_days} days</td>
                        <td style={{ padding: '8px' }}>
                          <Badge colorScheme={issuePerformance.color} fontSize="xs">
                            {issuePerformance.text}
                          </Badge>
                        </td>
                        <td style={{ padding: '8px' }}>{new Date(typedIssue.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '8px' }}>{new Date(typedIssue.completed_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
            {leadTimeData.issues.length > 10 && (
              <Text fontSize="sm" color="gray.600" mt={2}>
                Showing 10 of {leadTimeData.issues.length} issues
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default LeadTimeAnalytics;
