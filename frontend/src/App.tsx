import './App.css'
import { Routes, Route } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './features/dashboard/DashBoard';
import Velocity from './features/velocity/VelocityChart';
import EpicProgressChart from './features/epic/EpicProgressChart';
import TeamDashboard from './features/team/TeamDashboard';
import SprintDashboard from './features/sprint/SprintDashboard';
import HealthDashboard from './features/health/HealthDashboard';
import GitLabIntegration from './features/gitlab-integration/GitLabIntegration';
import SprintPlanning from './features/sprint-planning/SprintPlanning';
import QualityAnalytics from './features/quality/QualityAnalytics';
import RiskAssessment from './features/risk-assessment/RiskAssessment';
import RetrospectiveAnalytics from './features/retrospective/RetrospectiveAnalytics';
// New Developer Management Components
import DeveloperList from './features/developer-management/DeveloperList';
import CapacityPlanning from './features/developer-management/CapacityPlanning';
// New Provider Integration Components
import ProviderConfig from './features/provider-integration/ProviderConfig';
import ImportDevelopers from './features/provider-integration/ImportDevelopers';
// New Advanced Analytics Components
import LeadTimeAnalytics from './features/advanced-analytics/LeadTimeAnalytics';
// Issues Management
import IssuesManagement from './features/issues/IssuesManagement';
import NotFound from './pages/NotFound';
import { ProjectProvider } from './contexts/ProjectContext';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isSignedIn, isLoading, getToken } = useAuth();

  // Show loading while authentication is initializing
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Debug: Test token availability when signed in
  if (isSignedIn && getToken) {
    const testToken = async () => {
      try {
        const token = await getToken();
        console.log('🧪 Debug - Token available in App:', !!token);
        if (token) {
          console.log('🧪 Debug - Token preview:', token.substring(0, 20) + '...');
        }
      } catch (error) {
        console.error('🧪 Debug - Error getting token in App:', error);
      }
    };
    testToken();
  }

  // Show Clerk SignIn if user is not signed in
  if (!isSignedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <SignIn 
          appearance={{
            elements: {
              rootBox: {
                width: '100%',
                maxWidth: '400px'
              }
            }
          }}
        />
      </div>
    );
  }

  return (
    <ProjectProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          
          {/* Main Dashboards */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="team" element={<TeamDashboard />} />
          <Route path="sprint" element={<SprintDashboard />} />
          <Route path="health" element={<HealthDashboard />} />
          
          {/* Analytics & Metrics */}
          <Route path="velocity" element={<Velocity />} />
          <Route path="epic-chart" element={<EpicProgressChart />} />
          <Route path="quality" element={<QualityAnalytics />} />
          <Route path="risk-assessment" element={<RiskAssessment />} />
          <Route path="retrospective" element={<RetrospectiveAnalytics />} />
          
          {/* Sprint Planning */}
          <Route path="sprint-planning" element={<SprintPlanning />} />
          <Route path="capacity-planning" element={<CapacityPlanning />} />
          
          {/* Developer Management */}
          <Route path="developers" element={<DeveloperList />} />
          
          {/* Provider Integration */}
          <Route path="provider-config" element={<ProviderConfig />} />
          <Route path="import-developers" element={<ImportDevelopers />} />
          
          {/* Advanced Analytics */}
          <Route path="lead-time" element={<LeadTimeAnalytics />} />
          
          {/* Issues Management */}
          <Route path="issues" element={<IssuesManagement />} />
          
          {/* Legacy GitLab Integration */}
          <Route path="gitlab-integration" element={<GitLabIntegration />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ProjectProvider>
  )
}

export default App
