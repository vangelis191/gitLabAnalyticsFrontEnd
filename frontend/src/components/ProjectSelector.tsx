import React from 'react';
import {
  Box,
  HStack,
  Text,
  Spinner,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { useProject } from '../contexts/ProjectContext';

const ProjectSelector: React.FC = () => {
  const { selectedProject, projects, loading, error, setSelectedProject } = useProject();

  if (loading) {
    return (
      <HStack gap={2}>
        <Spinner size="sm" color="blue.500" />
        <Text fontSize="sm" color="gray.500">Loading projects...</Text>
      </HStack>
    );
  }

  if (error) {
    return (
      <Box p={2} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
        <Text fontSize="sm" color="red.600">Error loading projects</Text>
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Box p={2} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
        <Text fontSize="sm" color="yellow.600">No projects available</Text>
      </Box>
    );
  }

  return (
    <VStack gap={1} align="start">
      <Text fontSize="xs" color="gray.500" fontWeight="medium">
        Selected Project
      </Text>
      <HStack gap={2}>
        <select
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const project = projects.find(p => p.id === Number(e.target.value));
            setSelectedProject(project || null);
          }}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white'
          }}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        
        {selectedProject && (
          <HStack gap={1}>
            <Badge size="sm" colorScheme="blue" variant="subtle">
              {selectedProject.milestone_count} milestones
            </Badge>
            <Badge size="sm" colorScheme="green" variant="subtle">
              {selectedProject.epic_count} epics
            </Badge>
            <Badge size="sm" colorScheme="purple" variant="subtle">
              {selectedProject.issue_count} issues
            </Badge>
          </HStack>
        )}
      </HStack>
    </VStack>
  );
};

export default ProjectSelector; 