import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  IconButton,
  Input,
  Flex,
  Spacer,
  Heading,
} from '@chakra-ui/react';
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
} from '@chakra-ui/react';

// Removed toaster import - will use console.error instead 
import { FiPlus, FiEdit, FiSearch, FiUser, FiUsers, FiClock } from 'react-icons/fi';
import GitLabAnalyticsAPI, { type Developer } from '../../services/api';
import { useProject } from '../../hooks/useProject';
// import DeveloperForm from './DeveloperForm'; // Component not created yet

const DeveloperList: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const { selectedProject } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    loadDevelopers();
    loadTeams();
  }, [selectedProject]);

  useEffect(() => {
    filterDevelopers();
  }, [developers, selectedTeam, searchTerm]);

  const loadDevelopers = async () => {
    try {
      setLoading(true);
      const data = await GitLabAnalyticsAPI.getAllDevelopers(
        selectedProject?.id,
        selectedTeam || undefined
      );
      setDevelopers(data);
    } catch (error) {
      console.error('Error loading developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await GitLabAnalyticsAPI.getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const filterDevelopers = () => {
    let filtered = developers;

    if (selectedTeam) {
      filtered = filtered.filter(dev => dev.team_name === selectedTeam);
    }

    if (searchTerm) {
      filtered = filtered.filter(dev =>
        dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDevelopers(filtered);
  };

  const handleEditDeveloper = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setIsEditOpen(true);
  };

  const handleDeveloperSaved = () => {
    loadDevelopers();
    setIsOpen(false);
    setIsEditOpen(false);
    setSelectedDeveloper(null);
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'senior': return 'green';
      case 'intermediate': return 'blue';
      case 'junior': return 'orange';
      default: return 'gray';
    }
  };

  const getActiveBadgeColor = (isActive: boolean) => {
    return isActive ? 'green' : 'red';
  };

    return (
    <Box p={6}>
      <Box bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200" p={6}>
        <VStack gap={6} align="stretch">
          {/* Header */}
          <Flex align="center">
            <HStack gap={3}>
              <FiUsers size={24} />
              <Heading size="lg">Developer Management</Heading>
            </HStack>
            <Spacer />
            <Button
              colorScheme="blue"
              onClick={() => setIsOpen(true)}
            >
              <FiPlus style={{ marginRight: '8px' }} />
              Add Developer
            </Button>
          </Flex>

          {/* Filters */}
          <HStack gap={4}>
              <Box position="relative" maxW="300px">
                <Input
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  paddingLeft="40px"
                />
                <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                  <FiSearch />
                </Box>
              </Box>
              
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                style={{ maxWidth: '200px', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>

              <Button variant="outline" onClick={loadDevelopers}>
                Refresh
              </Button>
          </HStack>

          {/* Stats */}
          <HStack gap={6}>
              <HStack gap={2}>
                <FiUser />
                <Text fontWeight="medium">
                  Total: {filteredDevelopers.length}
                </Text>
              </HStack>
              <HStack gap={2}>
                <FiUsers />
                <Text fontWeight="medium">
                  Active: {filteredDevelopers.filter(d => d.is_active).length}
                </Text>
              </HStack>
              <HStack gap={2}>
                <FiClock />
                <Text fontWeight="medium">
                  Teams: {teams.length}
                </Text>
              </HStack>
          </HStack>

          {/* Table */}
          <Box overflowX="auto">
              <TableRoot variant="outline">
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader>Name</TableColumnHeader>
                    <TableColumnHeader>Email</TableColumnHeader>
                    <TableColumnHeader>Team</TableColumnHeader>
                    <TableColumnHeader>Experience</TableColumnHeader>
                    <TableColumnHeader>Hours/Day</TableColumnHeader>
                    <TableColumnHeader>Availability</TableColumnHeader>
                    <TableColumnHeader>Rate</TableColumnHeader>
                    <TableColumnHeader>Status</TableColumnHeader>
                    <TableColumnHeader>Actions</TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} textAlign="center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredDevelopers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} textAlign="center">No developers found</TableCell>
                    </TableRow>
                  ) : (
                    filteredDevelopers.map((developer) => (
                      <TableRow key={developer.id}>
                        <TableCell>
                          <VStack align="start" gap={1}>
                            <Text fontWeight="medium">{developer.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {developer.provider_type}: {developer.provider_username}
                            </Text>
                          </VStack>
                        </TableCell>
                        <TableCell>{developer.email}</TableCell>
                        <TableCell>{developer.team_name}</TableCell>
                        <TableCell>
                          <Badge
                            colorScheme={getExperienceBadgeColor(developer.experience_level)}
                          >
                            {developer.experience_level}
                          </Badge>
                        </TableCell>
                        <TableCell>{developer.working_hours_per_day}h</TableCell>
                        <TableCell>{(developer.availability_factor * 100).toFixed(0)}%</TableCell>
                        <TableCell>${developer.hourly_rate}/h</TableCell>
                        <TableCell>
                          <Badge
                            colorScheme={getActiveBadgeColor(developer.is_active)}
                          >
                            {developer.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="Edit developer"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditDeveloper(developer)}
                          >
                            <FiEdit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
          </Box>
        </VStack>
      </Box>

      {/* Add Developer Modal */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="modal"
          onClick={() => setIsOpen(false)}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            p={6}
            maxW="xl"
            w="full"
            mx={4}
            onClick={(e) => e.stopPropagation()}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>Add New Developer</Text>
            <Text>DeveloperForm component not created yet</Text>
            <HStack mt={4} gap={2}>
              <Button onClick={handleDeveloperSaved} colorScheme="blue">Save</Button>
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>
            </HStack>
          </Box>
        </Box>
      )}

      {/* Edit Developer Modal */}
      {isEditOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="modal"
          onClick={() => setIsEditOpen(false)}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            p={6}
            maxW="xl"
            w="full"
            mx={4}
            onClick={(e) => e.stopPropagation()}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>Edit Developer</Text>
            {selectedDeveloper && (
              <Text>DeveloperForm component not created yet</Text>
            )}
            <HStack mt={4} gap={2}>
              <Button onClick={handleDeveloperSaved} colorScheme="blue">Save</Button>
              <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DeveloperList;
