import React, { useState, useEffect, type ReactNode } from 'react';
import GitLabAnalyticsAPI, { type Project } from '../services/api';
import { ProjectContext } from './ProjectContextDef';

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      console.log('🔄 fetchProjects - Starting...');
      setLoading(true);
      setError(null);
      const projectsData = await GitLabAnalyticsAPI.getProjects();
      console.log('✅ fetchProjects - Success:', projectsData);
      setProjects(projectsData);
      
      // Auto-select first project if none selected
      if (!selectedProject && projectsData.length > 0) {
        setSelectedProject(projectsData[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Project fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProjects = () => {
    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const value = {
    selectedProject,
    projects,
    loading,
    error,
    setSelectedProject,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 