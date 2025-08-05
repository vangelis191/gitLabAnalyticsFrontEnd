import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import GitLabAnalyticsAPI, { type Project } from '../services/api';

interface ProjectContextType {
  selectedProject: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
  setSelectedProject: (project: Project | null) => void;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

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
      setLoading(true);
      setError(null);
      const projectsData = await GitLabAnalyticsAPI.getProjects();
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

  const value: ProjectContextType = {
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