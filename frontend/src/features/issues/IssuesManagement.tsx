import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Icon,
  Input,
  Wrap,
  WrapItem,
  Skeleton,
  SkeletonText,
  IconButton,
  CloseButton,
} from '@chakra-ui/react';

import {
  FiFilter,
  FiSearch,
  FiUser,
  FiUserX,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMoreVertical,
  FiList,
  FiGrid,
  FiChevronDown,
} from 'react-icons/fi';
import GitLabAnalyticsAPI, { type Issue } from '../../services/api';
import { useProject } from '../../hooks/useProject';

// Filter types
type AssignmentFilter = 'all' | 'assigned' | 'unassigned';
type StateFilter = 'all' | 'opened' | 'closed';
type ViewMode = 'grid' | 'list';

interface FilterState {
  assignment: AssignmentFilter;
  state: StateFilter;
  developer: string;
  labels: string[];
  search: string;
  milestone: string;
}



const IssuesManagement: React.FC = () => {
  const { selectedProject } = useProject();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FilterState>({
    assignment: 'all',
    state: 'all',
    developer: '',
    labels: [],
    search: '',
    milestone: '',
  });

  // Helper function to check if an issue has a valid assignee
  const hasValidAssignee = (issue: Issue) => {
    return issue.assignee && typeof issue.assignee === 'string' && issue.assignee.trim() !== '';
  };

  // Derived data for filter options
  const developers = useMemo(() => {
    if (!Array.isArray(issues)) return [];
    const devs = [...new Set(issues
      .filter(issue => hasValidAssignee(issue))
      .map(issue => issue.assignee!)
    )];
    return devs.sort();
  }, [issues]);

  const allLabels = useMemo(() => {
    if (!Array.isArray(issues)) return [];
    const labels = issues.flatMap(issue => issue.labels || []);
    return [...new Set(labels)].sort();
  }, [issues]);

  const milestones = useMemo(() => {
    if (!Array.isArray(issues)) return [];
    const milestones = [...new Set(issues.map(issue => issue.milestone?.title || issue.milestone_title).filter(Boolean))];
    return milestones.sort();
  }, [issues]);

  // Load issues
  useEffect(() => {
    const loadIssues = async () => {
      console.log('🔄 Loading issues...', { selectedProject });
      setLoading(true);
      setError(null);
      
      try {
        // Always try to load all issues first, regardless of selected project
        console.log('📋 Fetching all issues...');
        const issuesData = await GitLabAnalyticsAPI.getAllIssues();
        console.log('✅ Raw API response:', issuesData);
        
        // Handle different response formats
        let finalIssues: Issue[] = [];
        
        if (Array.isArray(issuesData)) {
          console.log('📋 Response is array, using directly');
          finalIssues = issuesData;
        } else if (issuesData && typeof issuesData === 'object') {
          const response = issuesData as Record<string, unknown>;
          if ('issues' in response && Array.isArray(response.issues)) {
            console.log('📋 Response has issues property, extracting');
            finalIssues = response.issues as Issue[];
          } else if ('data' in response && Array.isArray(response.data)) {
            console.log('📋 Response has data property, extracting');
            finalIssues = response.data as Issue[];
          } else {
            console.log('📋 Response is object but no recognizable array property');
            finalIssues = [];
          }
        } else {
          console.log('📋 Response is not array or object');
          finalIssues = [];
        }
        
        console.log('✅ Final issues array:', finalIssues.length, 'issues');
        
        // If we have a selected project, filter to that project's issues
        if (selectedProject && finalIssues.length > 0) {
          const projectIssues = finalIssues.filter(issue => {
            const issueWithProjectId = issue as Issue & { project_id?: number };
            return issue.project?.id === selectedProject.id || 
                   issueWithProjectId.project_id === selectedProject.id;
          });
          console.log(`📋 Filtered to project ${selectedProject.id}:`, projectIssues.length, 'issues');
          setIssues(projectIssues);
        } else {
          setIssues(finalIssues);
        }
        
      } catch (error) {
        console.error('❌ Error loading issues:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load issues';
        setError(errorMessage);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [selectedProject]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    console.log('🔍 Filtering issues...', { 
      totalIssues: issues.length, 
      filters, 
      sampleIssue: issues[0] 
    });
    
    if (!Array.isArray(issues)) {
      console.log('❌ Issues is not an array:', issues);
      return [];
    }
    
    const filtered = issues.filter(issue => {
      // Assignment filter - handle null, undefined, and empty string assignees
      if (filters.assignment === 'assigned' && !hasValidAssignee(issue)) return false;
      if (filters.assignment === 'unassigned' && hasValidAssignee(issue)) return false;

      // State filter
      if (filters.state === 'opened' && issue.state !== 'opened') return false;
      if (filters.state === 'closed' && issue.state !== 'closed') return false;

      // Developer filter
      if (filters.developer && issue.assignee !== filters.developer) return false;

      // Labels filter
      if (filters.labels.length > 0) {
        const hasAllLabels = filters.labels.every(label => 
          issue.labels?.includes(label)
        );
        if (!hasAllLabels) return false;
      }

      // Milestone filter
      if (filters.milestone && (issue.milestone?.title || issue.milestone_title) !== filters.milestone) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(searchLower);
        const matchesDescription = issue.description?.toLowerCase().includes(searchLower);
        const matchesId = issue.id.toString().includes(searchLower);
        if (!matchesTitle && !matchesDescription && !matchesId) return false;
      }

      return true;
    });
    
    console.log('✅ Filtered issues result:', { 
      originalCount: issues.length, 
      filteredCount: filtered.length,
      filtered: filtered.slice(0, 3) // Show first 3 issues for debugging
    });
    
    return filtered;
  }, [issues, filters]);

  // Filter handlers
  const updateFilter = (key: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addLabelFilter = (label: string) => {
    if (!filters.labels.includes(label)) {
      setFilters(prev => ({ ...prev, labels: [...prev.labels, label] }));
    }
  };

  const removeLabelFilter = (label: string) => {
    setFilters(prev => ({ 
      ...prev, 
      labels: prev.labels.filter(l => l !== label) 
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      assignment: 'all',
      state: 'all',
      developer: '',
      labels: [],
      search: '',
      milestone: '',
    });
  };

  // Manual reload function for debugging
  const manualReload = async () => {
    console.log('🔄 Manual reload triggered');
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Manual: Fetching all issues...');
      const issuesData = await GitLabAnalyticsAPI.getAllIssues();
      console.log('✅ Manual: Raw API response:', issuesData);
      setIssues(Array.isArray(issuesData) ? issuesData : []);
    } catch (error) {
      console.error('❌ Manual: Error loading issues:', error);
      setError(error instanceof Error ? error.message : 'Failed to load issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'opened': return 'green';
      case 'closed': return 'gray';
      default: return 'blue';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'opened': return FiAlertCircle;
      case 'closed': return FiCheckCircle;
      default: return FiXCircle;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };



  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" gap={1}>
              <Heading size="xl" color="gray.800">Issues Management</Heading>
              <Text color="gray.600">
                Manage and filter issues for {selectedProject?.name || 'GitLab Analytics Platform'}
              </Text>
            </VStack>
            
            <HStack gap={2}>
              <IconButton
                aria-label="Grid view"
                variant={viewMode === 'grid' ? 'solid' : 'outline'}
                colorScheme="blue"
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </IconButton>
              <IconButton
                aria-label="List view"
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                colorScheme="blue"
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </IconButton>
            </HStack>
          </HStack>

          {/* Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={6}>
            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Total Issues</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">{filteredIssues.length}</Text>
              {issues.length !== filteredIssues.length && (
                <Text fontSize="xs" color="gray.500">({issues.length} total loaded)</Text>
              )}
              <Text fontSize="xs" color="gray.400">Debug: {loading ? 'Loading...' : `${issues.length} raw issues loaded`}</Text>
            </Box>
            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Open Issues</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {filteredIssues.filter(i => i.state === 'opened').length}
              </Text>
            </Box>
            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Closed Issues</Text>
              <Text fontSize="2xl" fontWeight="bold" color="gray.600">
                {filteredIssues.filter(i => i.state === 'closed').length}
              </Text>
            </Box>
            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Unassigned</Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {filteredIssues.filter(i => !hasValidAssignee(i)).length}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Filters */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
          <VStack gap={4} align="stretch">
            <HStack justify="space-between" align="center">
              <HStack gap={2}>
                <Icon as={FiFilter} color="gray.600" />
                <Text fontWeight="semibold" color="gray.700">Filters</Text>
              </HStack>
              <HStack gap={2}>
                <Button size="sm" variant="ghost" onClick={manualReload} loading={loading}>
                  🔄 Reload Issues
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </HStack>
            </HStack>

            {/* Filter Controls */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {/* Search */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>Search</Text>
                <Box position="relative">
                  <Input
                    placeholder="Search issues..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    pl={10}
                  />
                  <Icon as={FiSearch} color="gray.400" position="absolute" left={3} top="50%" transform="translateY(-50%)" />
                </Box>
              </Box>

              {/* Assignment Status */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>Assignment</Text>
                <Box border="1px solid" borderColor="gray.200" borderRadius="md">
                  <select
                    value={filters.assignment}
                    onChange={(e) => updateFilter('assignment', e.target.value as AssignmentFilter)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      outline: 'none'
                    }}
                  >
                    <option value="all">All Issues</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </Box>
              </Box>

              {/* State */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>State</Text>
                <Box border="1px solid" borderColor="gray.200" borderRadius="md">
                  <select
                    value={filters.state}
                    onChange={(e) => updateFilter('state', e.target.value as StateFilter)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      outline: 'none'
                    }}
                  >
                    <option value="all">All States</option>
                    <option value="opened">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </Box>
              </Box>

              {/* Developer */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>Developer</Text>
                <Box border="1px solid" borderColor="gray.200" borderRadius="md">
                  <select
                    value={filters.developer}
                    onChange={(e) => updateFilter('developer', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      outline: 'none'
                    }}
                  >
                    <option value="">All Developers</option>
                    {developers.map(dev => (
                      <option key={dev} value={dev}>{dev}</option>
                    ))}
                  </select>
                </Box>
              </Box>

              {/* Milestone */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>Milestone</Text>
                <Box border="1px solid" borderColor="gray.200" borderRadius="md">
                  <select
                    value={filters.milestone}
                    onChange={(e) => updateFilter('milestone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      outline: 'none'
                    }}
                  >
                    <option value="">All Milestones</option>
                    {milestones.map(milestone => (
                      <option key={milestone} value={milestone}>{milestone}</option>
                    ))}
                  </select>
                </Box>
              </Box>

              {/* Labels */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>Labels</Text>
                <VStack gap={2} align="stretch">
                  <Button 
                    variant="outline" 
                    w="full" 
                    size="sm"
                    onClick={() => {}}
                  >
                    <HStack justify="space-between" w="full">
                      <Text>{filters.labels.length > 0 ? `${filters.labels.length} selected` : 'Select Labels'}</Text>
                      <Icon as={FiChevronDown} />
                    </HStack>
                  </Button>
                  {allLabels.length > 0 && (
                    <Box 
                      maxH="150px" 
                      overflowY="auto" 
                      border="1px solid" 
                      borderColor="gray.200" 
                      borderRadius="md" 
                      p={2}
                    >
                      <VStack gap={1} align="stretch">
                        {allLabels.map(label => (
                          <HStack 
                            key={label} 
                            p={1} 
                            cursor="pointer"
                            onClick={() => {
                              if (filters.labels.includes(label)) {
                                removeLabelFilter(label);
                              } else {
                                addLabelFilter(label);
                              }
                            }}
                            _hover={{ bg: 'gray.50' }}
                            borderRadius="sm"
                          >
                            <input 
                              type="checkbox" 
                              checked={filters.labels.includes(label)}
                              onChange={() => {}}
                              style={{ pointerEvents: 'none' }}
                            />
                            <Text fontSize="sm">{label}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Box>
            </SimpleGrid>

            {/* Active Filters */}
            {(filters.labels.length > 0 || filters.developer || filters.milestone || filters.search) && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>Active Filters:</Text>
                <Wrap>
                  {filters.search && (
                    <WrapItem>
                      <Badge colorScheme="blue" variant="subtle" p={2} borderRadius="md">
                        <HStack gap={1}>
                          <Text fontSize="sm">Search: "{filters.search}"</Text>
                          <CloseButton size="sm" onClick={() => updateFilter('search', '')} />
                        </HStack>
                      </Badge>
                    </WrapItem>
                  )}
                  {filters.developer && (
                    <WrapItem>
                      <Badge colorScheme="green" variant="subtle" p={2} borderRadius="md">
                        <HStack gap={1}>
                          <Text fontSize="sm">Developer: {filters.developer}</Text>
                          <CloseButton size="sm" onClick={() => updateFilter('developer', '')} />
                        </HStack>
                      </Badge>
                    </WrapItem>
                  )}
                  {filters.milestone && (
                    <WrapItem>
                      <Badge colorScheme="purple" variant="subtle" p={2} borderRadius="md">
                        <HStack gap={1}>
                          <Text fontSize="sm">Milestone: {filters.milestone}</Text>
                          <CloseButton size="sm" onClick={() => updateFilter('milestone', '')} />
                        </HStack>
                      </Badge>
                    </WrapItem>
                  )}
                  {filters.labels.map(label => (
                    <WrapItem key={label}>
                      <Badge colorScheme="orange" variant="subtle" p={2} borderRadius="md">
                        <HStack gap={1}>
                          <Text fontSize="sm">{label}</Text>
                          <CloseButton size="sm" onClick={() => removeLabelFilter(label)} />
                        </HStack>
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Issues List */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {[...Array(6)].map((_, i) => (
              <Box key={i} bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <Skeleton height="20px" mb={4} />
                <SkeletonText mt={4} noOfLines={3} />
              </Box>
            ))}
          </SimpleGrid>
        ) : error ? (
          <Box textAlign="center" py={12}>
            <Icon as={FiXCircle} boxSize={12} color="red.400" mb={4} />
            <Heading size="md" color="red.600" mb={2}>Error Loading Issues</Heading>
            <Text color="red.500" mb={4}>{error}</Text>
            <Button 
              colorScheme="red" 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        ) : filteredIssues.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Icon as={FiAlertCircle} boxSize={12} color="gray.400" mb={4} />
            <Heading size="md" color="gray.600" mb={2}>No Issues Found</Heading>
            <Text color="gray.500" mb={2}>
              {issues.length === 0 
                ? "No issues have been loaded yet. Make sure your project has issues or try refreshing the page."
                : "Try adjusting your filters or search criteria to find issues."
              }
            </Text>
            {issues.length === 0 && (
              <Button 
                colorScheme="blue" 
                variant="outline" 
                onClick={() => window.location.reload()}
                mt={2}
              >
                Refresh Page
              </Button>
            )}
          </Box>
        ) : viewMode === 'grid' ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {filteredIssues.map(issue => (
              <Box key={issue.id} bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200" _hover={{ boxShadow: 'md' }} transition="all 0.2s">
                <VStack gap={4} align="stretch">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2}>
                        <Badge colorScheme={getStateColor(issue.state)} variant="subtle">
                          <HStack gap={1}>
                            <Icon as={getStateIcon(issue.state)} boxSize={3} />
                            <Text>{issue.state}</Text>
                          </HStack>
                        </Badge>
                        <Text fontSize="sm" color="gray.500">#{issue.id}</Text>
                      </HStack>
                      <Text fontWeight="semibold" fontSize="sm" lineHeight="1.3" display="-webkit-box" css={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} overflow="hidden">
                        {issue.title}
                      </Text>
                    </VStack>
                    <IconButton variant="ghost" size="sm" aria-label="More options">
                      <FiMoreVertical />
                    </IconButton>
                  </HStack>
                  {/* Assignee */}
                  <HStack gap={2}>
                    <Icon as={hasValidAssignee(issue) ? FiUser : FiUserX} color="gray.500" boxSize={4} />
                    {hasValidAssignee(issue) ? (
                      <HStack gap={2}>
                        <Box w="6" h="6" borderRadius="full" bg="blue.500" display="flex" alignItems="center" justifyContent="center" color="white" fontSize="xs" fontWeight="bold">
                          {issue.assignee[0]?.toUpperCase()}
                        </Box>
                        <Text fontSize="sm" color="gray.700">{issue.assignee}</Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500" fontStyle="italic">Unassigned</Text>
                    )}
                  </HStack>

                  {/* Milestone */}
                  {(issue.milestone?.title || issue.milestone_title) && (
                    <HStack gap={2}>
                      <Icon as={FiCalendar} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">{issue.milestone?.title || issue.milestone_title}</Text>
                    </HStack>
                  )}

                  {/* Priority */}
                  {issue.priority && (
                    <HStack gap={2}>
                      <Icon as={FiAlertCircle} color="gray.500" boxSize={4} />
                      <Badge colorScheme={getPriorityColor(issue.priority)} size="sm">
                        {issue.priority}
                      </Badge>
                    </HStack>
                  )}

                  {/* Time tracking */}
                  {(issue.time_estimate || issue.time_spent) && (
                    <HStack gap={2}>
                      <Icon as={FiClock} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">
                        {issue.time_spent || 0}h / {issue.time_estimate || 0}h
                      </Text>
                    </HStack>
                  )}

                  {/* Labels */}
                  {issue.labels && issue.labels.length > 0 && (
                    <Wrap>
                      {issue.labels.map(label => (
                        <WrapItem key={label}>
                          <Badge size="sm" colorScheme="gray" variant="outline">
                            {label}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}

                  {/* Created date */}
                  {issue.created_date && (
                    <Text fontSize="xs" color="gray.500">
                      Created {new Date(issue.created_date).toLocaleDateString()}
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          // List view
          <VStack gap={2} align="stretch">
            {filteredIssues.map(issue => (
              <Box key={issue.id} bg="white" borderRadius="lg" boxShadow="sm" border="1px solid" borderColor="gray.200" _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                <Box py={4} px={6}>
                  <HStack gap={4} align="center">
                    <Badge colorScheme={getStateColor(issue.state)} variant="subtle">
                      <HStack gap={1}>
                        <Icon as={getStateIcon(issue.state)} boxSize={3} />
                        <Text>{issue.state}</Text>
                      </HStack>
                    </Badge>
                    
                    <Text fontSize="sm" color="gray.500" minW="60px">#{issue.id}</Text>
                    
                    <Text fontWeight="medium" flex={1} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {issue.title}
                    </Text>
                    
                    {hasValidAssignee(issue) ? (
                      <HStack gap={2} minW="120px">
                        <Box w="6" h="6" borderRadius="full" bg="blue.500" display="flex" alignItems="center" justifyContent="center" color="white" fontSize="xs" fontWeight="bold">
                          {issue.assignee[0]?.toUpperCase()}
                        </Box>
                        <Text fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{issue.assignee}</Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500" fontStyle="italic" minW="120px">
                        Unassigned
                      </Text>
                    )}
                    
                    {(issue.milestone?.title || issue.milestone_title) && (
                      <Badge colorScheme="purple" variant="outline" size="sm">
                        {issue.milestone?.title || issue.milestone_title}
                      </Badge>
                    )}
                    
                    {issue.labels && issue.labels.length > 0 && (
                      <HStack gap={1}>
                        {issue.labels.slice(0, 2).map(label => (
                          <Badge key={label} size="sm" colorScheme="gray" variant="outline">
                            {label}
                          </Badge>
                        ))}
                        {issue.labels.length > 2 && (
                          <Text fontSize="xs" color="gray.500">+{issue.labels.length - 2}</Text>
                        )}
                      </HStack>
                    )}
                    
                    <Text fontSize="xs" color="gray.500" minW="80px">
                      {issue.created_date ? new Date(issue.created_date).toLocaleDateString() : 'No date'}
                    </Text>
                    
                    <IconButton variant="ghost" size="sm" aria-label="More options">
                      <FiMoreVertical />
                    </IconButton>
                  </HStack>
                </Box>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default IssuesManagement;

