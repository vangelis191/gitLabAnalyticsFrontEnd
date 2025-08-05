import './App.css'
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './features/dashboard/DashBoard';
import Velocity from './features/velocity/VelocityChart';
import EpicProgress from './features/epic/EpicProgress';
import EpicProgressChart from './features/epic/EpicProgressChart';
import TeamDashboard from './features/team/TeamDashboard';
import SprintDashboard from './features/sprint/SprintDashboard';
import HealthDashboard from './features/health/HealthDashboard';
import GitLabImport from './features/import/GitLabImport';
import NotFound from './pages/NotFound';
import Login from './components/Login';
import DevTokenButton from './components/DevTokenButton';
import { ProjectProvider } from './contexts/ProjectContext';

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      setIsAuthenticated(true);
      // You could also verify the token here if needed
    }
  }, []);

  const handleLogin = (userData: unknown) => {
    setIsAuthenticated(true);
    setUser(userData as User);
  };

  const handleLogout = () => {
    localStorage.removeItem('clerk-token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <DevTokenButton />
      </>
    );
  }

  return (
    <>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="velocity" element={<Velocity />} />
            <Route path="epics" element={<EpicProgress />} />
            <Route path="epic-chart" element={<EpicProgressChart />} />
            <Route path="team" element={<TeamDashboard />} />
            <Route path="sprint" element={<SprintDashboard />} />
            <Route path="health" element={<HealthDashboard />} />
            <Route path="import" element={<GitLabImport />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <DevTokenButton />
      </ProjectProvider>
    </>
  )
}

export default App
