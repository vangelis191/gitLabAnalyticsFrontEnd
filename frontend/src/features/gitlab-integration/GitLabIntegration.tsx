import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
} from '@chakra-ui/react';
import { FiDownload, FiSave, FiGitBranch, FiPlus } from 'react-icons/fi';
import { useProject } from '../../hooks/useProject';

interface GitLabIssue {
  id: number;
  title: string;
  state: string;
  assignee?: { name: string };
  labels: string[];
  time_estimate?: number;
  time_spent?: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

interface GitLabMilestone {
  id: number;
  title: string;
  description?: string;
  state: string;
  start_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectData {
  project_info: {
    id: number;
    name: string;
    gitlab_url: string;
    total_issues: number;
    total_milestones: number;
  };
  raw_issues: GitLabIssue[];
  raw_milestones: GitLabMilestone[];
  organized_by_labels: Record<string, GitLabIssue[]>;
  organized_by_assignee: Record<string, GitLabIssue[]>;
  organized_by_state: {
    open: GitLabIssue[];
    closed: GitLabIssue[];
  };
  organized_by_priority: {
    high: GitLabIssue[];
    medium: GitLabIssue[];
    low: GitLabIssue[];
  };
  organized_by_type: {
    bug: GitLabIssue[];
    feature: GitLabIssue[];
    task: GitLabIssue[];
  };
  statistics: {
    total_issues: number;
    open_issues: number;
    closed_issues: number;
    total_milestones: number;
    active_milestones: number;
    closed_milestones: number;
  };
}

interface AvailableIssue {
  id: number;
  title: string;
  state: string;
  assignee: string;
  issue_type: string;
  priority: string;
  time_estimate: number;
  time_spent: number;
}

const GitLabIntegration: React.FC = () => {
  const { selectedProject } = useProject();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [availableIssues, setAvailableIssues] = useState<AvailableIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateEpic, setShowCreateEpic] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [epicForm, setEpicForm] = useState({
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    issue_ids: [] as number[],
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    issue_ids: [] as number[],
  });

  const fetchProjectData = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/projects/${selectedProject.id}/gitlab/full-data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('clerk-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GitLab data');
      }

      const data = await response.json();
      setProjectData(data);
      alert(`Data fetched successfully! Found ${data.statistics.total_issues} issues and ${data.statistics.total_milestones} milestones`);
    } catch (error) {
      alert(`Error fetching data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async () => {
    if (!selectedProject) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/analytics/projects/${selectedProject.id}/gitlab/save-to-database`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('clerk-token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save data to database');
      }

      const result = await response.json();
      alert(`Data saved successfully! ${result.summary.epics_created} epics created, ${result.summary.issues_saved} issues saved`);
    } catch (error) {
      alert(`Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const fetchAvailableIssues = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/analytics/projects/${selectedProject.id}/available-issues`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('clerk-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available issues');
      }

      const data = await response.json();
      setAvailableIssues(data.available_issues);
    } catch (error) {
      alert(`Error fetching available issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createEpic = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/analytics/projects/${selectedProject.id}/epics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('clerk-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(epicForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create epic');
      }

      const result = await response.json();
      alert(`Epic created successfully! "${result.epic.title}" with ${result.epic.issues_count} issues`);
      setShowCreateEpic(false);
      setEpicForm({ title: '', description: '', start_date: '', due_date: '', issue_ids: [] });
    } catch (error) {
      alert(`Error creating epic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createMilestone = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/analytics/projects/${selectedProject.id}/milestones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('clerk-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(milestoneForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create milestone');
      }

      const result = await response.json();
      alert(`Milestone created successfully! "${result.milestone.title}" with ${result.milestone.issues_count} issues`);
      setShowCreateMilestone(false);
      setMilestoneForm({ title: '', description: '', start_date: '', due_date: '', issue_ids: [] });
    } catch (error) {
      alert(`Error creating milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getPriorityColor = (labels: string[]) => {
    if (labels.includes('high')) return 'red';
    if (labels.includes('low')) return 'green';
    return 'yellow';
  };



  useEffect(() => {
    if (showCreateEpic || showCreateMilestone) {
      fetchAvailableIssues();
    }
  }, [showCreateEpic, showCreateMilestone, selectedProject]);

  if (!selectedProject) {
    return (
      <Box p={6}>
        <Box p={4} bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="md">
          <HStack gap={3}>
            <Box w="4" h="4" bg="yellow.500" borderRadius="full" />
            <VStack align="start" gap={1}>
              <Text fontWeight="semibold">No project selected!</Text>
              <Text fontSize="sm">Please select a project from the dropdown to start working with GitLab integration.</Text>
            </VStack>
          </HStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box p={6} bg="white" borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Heading size="lg" color="blue.600">
                <HStack>
                  <FiGitBranch />
                  <Text>GitLab Integration</Text>
                </HStack>
              </Heading>
              <Text color="gray.600">
                Project: {selectedProject.name}
              </Text>
            </VStack>
            <HStack gap={3}>
              <Button
                colorScheme="blue"
                onClick={fetchProjectData}
                loading={loading}
                loadingText="Fetching..."
              >
                <FiDownload style={{ marginRight: '8px' }} />
                Fetch GitLab Data
              </Button>
              <Button
                colorScheme="green"
                onClick={saveToDatabase}
                loading={saving}
                loadingText="Saving..."
                disabled={!projectData}
              >
                <FiSave style={{ marginRight: '8px' }} />
                Save to Database
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Navigation Tabs */}
        <HStack gap={2} borderBottom="1px solid" borderColor="gray.200" pb={2}>
          <Button
            variant={activeTab === 'overview' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('overview')}
            size="sm"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'issues' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('issues')}
            size="sm"
          >
            Issues by Labels
          </Button>
          <Button
            variant={activeTab === 'assignees' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('assignees')}
            size="sm"
          >
            Issues by Assignee
          </Button>
          <Button
            variant={activeTab === 'milestones' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('milestones')}
            size="sm"
          >
            Milestones
          </Button>
          <Button
            variant={activeTab === 'create' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('create')}
            size="sm"
          >
            Create Structure
          </Button>
        </HStack>

        {/* Content based on active tab */}
        {activeTab === 'overview' && projectData && (
          <>
            {/* Statistics */}
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <Box p={4} bg="white" borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.500">Total Issues</Text>
                  <Text fontSize="2xl" fontWeight="bold">{projectData.statistics.total_issues}</Text>
                  <Text fontSize="xs" color="green.500">
                    {projectData.statistics.open_issues} open, {projectData.statistics.closed_issues} closed
                  </Text>
                </VStack>
              </Box>
              <Box p={4} bg="white" borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.500">Total Milestones</Text>
                  <Text fontSize="2xl" fontWeight="bold">{projectData.statistics.total_milestones}</Text>
                  <Text fontSize="xs" color="blue.500">
                    {projectData.statistics.active_milestones} active, {projectData.statistics.closed_milestones} closed
                  </Text>
                </VStack>
              </Box>
              <Box p={4} bg="white" borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.500">Completion Rate</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {projectData.statistics.total_issues > 0 
                      ? Math.round((projectData.statistics.closed_issues / projectData.statistics.total_issues) * 100)
                      : 0}%
                  </Text>
                  <Box w="full" bg="gray.200" borderRadius="full" h="8px">
                    <Box 
                      bg="green.500" 
                      h="8px" 
                      borderRadius="full"
                      w={`${projectData.statistics.total_issues > 0 
                        ? (projectData.statistics.closed_issues / projectData.statistics.total_issues) * 100
                        : 0}%`}
                    />
                  </Box>
                </VStack>
              </Box>
            </Grid>
          </>
        )}

        {activeTab === 'issues' && projectData && (
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md">Issues Organized by Labels (Potential Epics)</Heading>
              <Button
                colorScheme="blue"
                onClick={() => setShowCreateEpic(true)}
                size="sm"
              >
                <FiPlus style={{ marginRight: '4px' }} />
                Create Epic
              </Button>
            </HStack>
            
            {Object.entries(projectData.organized_by_labels).map(([label, issues]) => (
              <Box key={label} p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <HStack justify="space-between" mb={3}>
                  <VStack align="start" gap={1}>
                    <Text fontWeight="semibold" fontSize="lg">{label}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {issues.length} issues
                    </Text>
                  </VStack>
                  <Badge colorScheme="blue" variant="subtle">
                    Epic Candidate
                  </Badge>
                </HStack>
                <VStack gap={2} align="stretch">
                  {issues.slice(0, 5).map((issue) => (
                    <HStack key={issue.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                      <VStack align="start" gap={0}>
                        <Text fontWeight="medium" fontSize="sm">{issue.title}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {issue.assignee?.name || 'Unassigned'}
                        </Text>
                      </VStack>
                      <HStack gap={2}>
                        <Badge colorScheme={issue.state === 'opened' ? 'green' : 'gray'} size="sm">
                          {issue.state}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(issue.labels)} size="sm">
                          {issue.labels.includes('high') ? 'High' : issue.labels.includes('low') ? 'Low' : 'Medium'}
                        </Badge>
                      </HStack>
                    </HStack>
                  ))}
                  {issues.length > 5 && (
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      +{issues.length - 5} more issues
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>
        )}

        {activeTab === 'assignees' && projectData && (
          <VStack gap={4} align="stretch">
            <Heading size="md">Issues by Assignee</Heading>
            {Object.entries(projectData.organized_by_assignee).map(([assignee, issues]) => (
              <Box key={assignee} p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="semibold" fontSize="lg">{assignee}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {issues.length} issues
                    </Text>
                  </VStack>
                  <HStack gap={2}>
                    <Badge colorScheme="green" size="sm">
                      {issues.filter(i => i.state === 'closed').length} closed
                    </Badge>
                    <Badge colorScheme="orange" size="sm">
                      {issues.filter(i => i.state === 'opened').length} open
                    </Badge>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {activeTab === 'milestones' && projectData && (
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md">GitLab Milestones</Heading>
              <Button
                colorScheme="blue"
                onClick={() => setShowCreateMilestone(true)}
                size="sm"
              >
                <FiPlus style={{ marginRight: '4px' }} />
                Create Milestone
              </Button>
            </HStack>
            
            {projectData.raw_milestones.length > 0 ? (
              projectData.raw_milestones.map((milestone) => (
                <Box key={milestone.id} p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="semibold" fontSize="lg">{milestone.title}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {milestone.description || 'No description'}
                      </Text>
                      <HStack gap={4}>
                        <Text fontSize="sm">
                          <strong>Start:</strong> {milestone.start_date || 'Not set'}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Due:</strong> {milestone.due_date || 'Not set'}
                        </Text>
                      </HStack>
                    </VStack>
                    <Badge colorScheme={milestone.state === 'active' ? 'green' : 'gray'}>
                      {milestone.state}
                    </Badge>
                  </HStack>
                </Box>
              ))
            ) : (
              <Box p={4} bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md">
                <HStack gap={3}>
                  <Box w="4" h="4" bg="blue.500" borderRadius="full" />
                  <Text>No milestones found for this project.</Text>
                </HStack>
              </Box>
            )}
          </VStack>
        )}

        {activeTab === 'create' && (
          <VStack gap={6} align="stretch">
            <Heading size="md">Create Custom Structure</Heading>
            
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
              <Box p={6} bg="white" borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
                <VStack gap={4}>
                  <Text fontWeight="semibold" fontSize="lg">Create Epic</Text>
                  <Text fontSize="sm" color="gray.600">
                    Create a custom epic (6 months duration) and assign issues to it.
                  </Text>
                  <Button
                    colorScheme="blue"
                    onClick={() => setShowCreateEpic(true)}
                    w="full"
                  >
                    <FiPlus style={{ marginRight: '8px' }} />
                    Create New Epic
                  </Button>
                </VStack>
              </Box>

              <Box p={6} bg="white" borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
                <VStack gap={4}>
                  <Text fontWeight="semibold" fontSize="lg">Create Milestone</Text>
                  <Text fontSize="sm" color="gray.600">
                    Create a custom milestone (2 weeks duration) and assign issues to it.
                  </Text>
                  <Button
                    colorScheme="green"
                    onClick={() => setShowCreateMilestone(true)}
                    w="full"
                  >
                    <FiPlus style={{ marginRight: '8px' }} />
                    Create New Milestone
                  </Button>
                </VStack>
              </Box>
            </Grid>
          </VStack>
        )}

        {/* Create Epic Modal */}
        {showCreateEpic && (
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
            <Box p={6} bg="white" borderRadius="lg" maxW="600px" w="full" mx={4}>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Create Custom Epic</Heading>
                  <Button variant="ghost" onClick={() => setShowCreateEpic(false)} size="sm">
                    ✕
                  </Button>
                </HStack>
                
                <VStack gap={3} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={1}>Epic Title *</Text>
                    <input
                      type="text"
                      value={epicForm.title}
                      onChange={(e) => setEpicForm({ ...epicForm, title: e.target.value })}
                      placeholder="e.g., User Authentication System"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={1}>Description</Text>
                    <textarea
                      value={epicForm.description}
                      onChange={(e) => setEpicForm({ ...epicForm, description: e.target.value })}
                      placeholder="Describe the epic..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </Box>
                  
                  <HStack gap={3}>
                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1}>Start Date *</Text>
                      <input
                        type="date"
                        value={epicForm.start_date}
                        onChange={(e) => setEpicForm({ ...epicForm, start_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </Box>
                    
                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1}>Due Date *</Text>
                      <input
                        type="date"
                        value={epicForm.due_date}
                        onChange={(e) => setEpicForm({ ...epicForm, due_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </Box>
                  </HStack>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Select Issues to Assign</Text>
                    <VStack gap={2} align="start" maxH="200px" overflowY="auto">
                      {availableIssues.slice(0, 10).map((issue) => (
                        <label key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={epicForm.issue_ids.includes(issue.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEpicForm({ ...epicForm, issue_ids: [...epicForm.issue_ids, issue.id] });
                              } else {
                                setEpicForm({ ...epicForm, issue_ids: epicForm.issue_ids.filter(id => id !== issue.id) });
                              }
                            }}
                          />
                          <VStack align="start" gap={0}>
                            <Text fontSize="sm" fontWeight="medium">{issue.title}</Text>
                            <Text fontSize="xs" color="gray.600">
                              {issue.assignee} • {issue.state}
                            </Text>
                          </VStack>
                        </label>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
                
                <HStack gap={3} justify="flex-end">
                  <Button variant="ghost" onClick={() => setShowCreateEpic(false)}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" onClick={createEpic}>
                    Create Epic
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Create Milestone Modal */}
        {showCreateMilestone && (
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
            <Box p={6} bg="white" borderRadius="lg" maxW="600px" w="full" mx={4}>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Create Custom Milestone</Heading>
                  <Button variant="ghost" onClick={() => setShowCreateMilestone(false)} size="sm">
                    ✕
                  </Button>
                </HStack>
                
                <VStack gap={3} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={1}>Milestone Title *</Text>
                    <input
                      type="text"
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                      placeholder="e.g., Sprint 1 - Authentication"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={1}>Description</Text>
                    <textarea
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                      placeholder="Describe the milestone..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </Box>
                  
                  <HStack gap={3}>
                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1}>Start Date *</Text>
                      <input
                        type="date"
                        value={milestoneForm.start_date}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, start_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </Box>
                    
                    <Box flex={1}>
                      <Text fontWeight="medium" mb={1}>Due Date *</Text>
                      <input
                        type="date"
                        value={milestoneForm.due_date}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </Box>
                  </HStack>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Select Issues to Assign</Text>
                    <VStack gap={2} align="start" maxH="200px" overflowY="auto">
                      {availableIssues.slice(0, 10).map((issue) => (
                        <label key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={milestoneForm.issue_ids.includes(issue.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMilestoneForm({ ...milestoneForm, issue_ids: [...milestoneForm.issue_ids, issue.id] });
                              } else {
                                setMilestoneForm({ ...milestoneForm, issue_ids: milestoneForm.issue_ids.filter(id => id !== issue.id) });
                              }
                            }}
                          />
                          <VStack align="start" gap={0}>
                            <Text fontSize="sm" fontWeight="medium">{issue.title}</Text>
                            <Text fontSize="xs" color="gray.600">
                              {issue.assignee} • {issue.state}
                            </Text>
                          </VStack>
                        </label>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
                
                <HStack gap={3} justify="flex-end">
                  <Button variant="ghost" onClick={() => setShowCreateMilestone(false)}>
                    Cancel
                  </Button>
                  <Button colorScheme="green" onClick={createMilestone}>
                    Create Milestone
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Info Section */}
        <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
          <VStack align="start" gap={2}>
            <Text fontWeight="semibold" color="gray.700">GitLab Integration Status</Text>
            <Text fontSize="sm" color="gray.600">
              This component provides full GitLab integration functionality. 
              It fetches project data, organizes issues by labels and assignees, and allows creating custom epics and milestones.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Use the tabs above to explore different views of your GitLab data and create custom project structures.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default GitLabIntegration; 