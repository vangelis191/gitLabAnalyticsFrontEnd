import './App.css'
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
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
import NotFound from './pages/NotFound';
import DevTokenButton from './components/DevTokenButton';
import { ProjectProvider } from './contexts/ProjectContext';

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
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
    <>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="velocity" element={<Velocity />} />
            {/* <Route path="epics" element={<EpicProgress />} /> */}
            <Route path="epic-chart" element={<EpicProgressChart />} />
            <Route path="team" element={<TeamDashboard />} />
            <Route path="sprint" element={<SprintDashboard />} />
            <Route path="sprint-planning" element={<SprintPlanning />} />
            <Route path="quality" element={<QualityAnalytics />} />
            <Route path="risk-assessment" element={<RiskAssessment />} />
            <Route path="retrospective" element={<RetrospectiveAnalytics />} />
            <Route path="health" element={<HealthDashboard />} />
            <Route path="gitlab-integration" element={<GitLabIntegration />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <DevTokenButton />
      </ProjectProvider>
    </>
  )
}

export default App
