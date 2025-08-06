import { createContext } from 'react';
import { type Project } from '../services/api';

interface ProjectContextType {
  selectedProject: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
  setSelectedProject: (project: Project | null) => void;
  refreshProjects: () => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined); 