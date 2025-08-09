import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Input,
  Button,
  Grid,
  GridItem,
  Text,
  Box,
  
} from '@chakra-ui/react';
import GitLabAnalyticsAPI from '../../services/api';
import type { Developer, CreateDeveloperRequest, UpdateDeveloperRequest } from '../../services/api';
import { useProject } from '../../hooks/useProject';

interface DeveloperFormProps {
  developer?: Developer;
  onSaved: () => void;
  onCancel: () => void;
}

const DeveloperForm: React.FC<DeveloperFormProps> = ({ developer, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    provider_type: 'gitlab',
    provider_username: '',
    working_hours_per_day: 8,
    working_days_per_week: 5,
    availability_factor: 0.85,
    experience_level: 'intermediate',
    hourly_rate: 35,
    team_name: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<string[]>([]);
  const { selectedProject } = useProject();

  const isEditMode = !!developer;

  useEffect(() => {
    loadTeams();
    if (developer) {
      setFormData({
        name: developer.name,
        email: developer.email,
        provider_type: developer.provider_type,
        provider_username: developer.provider_username,
        working_hours_per_day: developer.working_hours_per_day,
        working_days_per_week: developer.working_days_per_week,
        availability_factor: developer.availability_factor,
        experience_level: developer.experience_level,
        hourly_rate: developer.hourly_rate,
        team_name: developer.team_name,
        is_active: developer.is_active,
      });
    }
  }, [developer]);

  const loadTeams = async () => {
    try {
      const data = await GitLabAnalyticsAPI.getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject && !isEditMode) {
              alert('Please select a project before adding a developer');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && developer) {
        const updateData: UpdateDeveloperRequest = {
          working_hours_per_day: formData.working_hours_per_day,
          working_days_per_week: formData.working_days_per_week,
          availability_factor: formData.availability_factor,
          experience_level: formData.experience_level,
          hourly_rate: formData.hourly_rate,
          team_name: formData.team_name,
          is_active: formData.is_active,
        };
        await GitLabAnalyticsAPI.updateDeveloper(developer.id, updateData);
        alert('Developer updated successfully!');
      } else {
        const createData: CreateDeveloperRequest = {
          name: formData.name,
          email: formData.email,
          provider_type: formData.provider_type,
          provider_username: formData.provider_username,
          working_hours_per_day: formData.working_hours_per_day,
          working_days_per_week: formData.working_days_per_week,
          availability_factor: formData.availability_factor,
          experience_level: formData.experience_level,
          hourly_rate: formData.hourly_rate,
          team_name: formData.team_name,
          project_id: selectedProject!.id,
        };
        await GitLabAnalyticsAPI.createDeveloper(createData);
        alert('Developer created successfully!');
      }
      onSaved();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data)
        ? String(error.response.data.error) : 'An unexpected error occurred';
      alert(`Error ${isEditMode ? 'updating' : 'creating'} developer: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateWeeklyCapacity = () => {
    const totalHours = formData.working_hours_per_day * formData.working_days_per_week;
    const availableHours = totalHours * formData.availability_factor;
    return availableHours.toFixed(1);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap={6} alignItems="stretch">
        {!isEditMode && (
          <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
            <VStack gap={1} alignItems="start">
              <Text fontWeight="bold" color="blue.700">Adding developer to project:</Text>
              <Text color="blue.600">{selectedProject?.name}</Text>
            </VStack>
          </Box>
        )}

        {/* Basic Information */}
        <VStack gap={4} alignItems="stretch">
          <Text fontSize="lg" fontWeight="medium">Basic Information</Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Name *</Text>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isEditMode}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Email *</Text>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isEditMode}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
          </Grid>

          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Provider Type *</Text>
                <select
                  value={formData.provider_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('provider_type', e.target.value)}
                  disabled={isEditMode}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="gitlab">GitLab</option>
                  <option value="azure">Azure DevOps</option>
                  <option value="jira">Jira</option>
                </select>
              </Box>
            </GridItem>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Provider Username *</Text>
                <Input
                  value={formData.provider_username}
                  onChange={(e) => handleInputChange('provider_username', e.target.value)}
                  disabled={isEditMode}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
          </Grid>
        </VStack>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

        {/* Work Configuration */}
        <VStack gap={4} alignItems="stretch">
          <Text fontSize="lg" fontWeight="medium">Work Configuration</Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Working Hours per Day *</Text>
                <input
                  type="number"
                  value={formData.working_hours_per_day}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('working_hours_per_day', parseFloat(e.target.value) || 0)}
                  min={1}
                  max={12}
                  step={0.5}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Working Days per Week *</Text>
                <input
                  type="number"
                  value={formData.working_days_per_week}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('working_days_per_week', parseInt(e.target.value) || 0)}
                  min={1}
                  max={7}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
          </Grid>

          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Availability Factor (%) *</Text>
                <input
                  type="number"
                  value={formData.availability_factor * 100}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('availability_factor', (parseFloat(e.target.value) || 0) / 100)}
                  min={10}
                  max={100}
                  step={5}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Weekly Capacity</Text>
                <Input
                  value={`${calculateWeeklyCapacity()} hours`}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f9f9f9'
                  }}
                />
              </Box>
            </GridItem>
          </Grid>
        </VStack>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

        {/* Team & Experience */}
        <VStack gap={4} alignItems="stretch">
          <Text fontSize="lg" fontWeight="medium">Team & Experience</Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Team Name *</Text>
                <select
                  value={formData.team_name}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('team_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    marginBottom: '8px'
                  }}
                >
                  <option value="">Select or type team name</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                <Input
                  placeholder="Or enter new team name"
                  value={!teams.includes(formData.team_name) ? formData.team_name : ''}
                  onChange={(e) => handleInputChange('team_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Experience Level *</Text>
                <select
                  value={formData.experience_level}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('experience_level', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </Box>
            </GridItem>
          </Grid>

          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Box>
                <Text fontWeight="medium" mb={1} color="gray.700">Hourly Rate ($) *</Text>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                  min={1}
                  max={500}
                  step={5}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </GridItem>
            {isEditMode && (
              <GridItem>
                <Box>
                  <Text fontWeight="medium" mb={1} color="gray.700">Active Status</Text>
                  <HStack>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('is_active', e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <Text>{formData.is_active ? 'Active' : 'Inactive'}</Text>
                  </HStack>
                </Box>
              </GridItem>
            )}
          </Grid>
        </VStack>

        {/* Action Buttons */}
        <HStack gap={4} justifyContent="end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            loading={loading}
            loadingText={isEditMode ? 'Updating...' : 'Creating...'}
          >
            {isEditMode ? 'Update Developer' : 'Create Developer'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default DeveloperForm;
