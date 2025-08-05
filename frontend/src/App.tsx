import './App.css'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import Home from './pages/Home';
import { UserButton } from '@clerk/clerk-react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/DashBoard';
import Velocity from './features/velocity/VelocityChart';
import EpicProgress from './features/epic/EpicProgress';
import TeamDashboard from './features/team/TeamDashboard';
import SprintDashboard from './features/sprint/SprintDashboard';
import HealthDashboard from './features/health/HealthDashboard';
import GitLabImport from './features/import/GitLabImport';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <SignedIn>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="velocity" element={<Velocity />} />
            <Route path="epics" element={<EpicProgress />} />
            <Route path="team" element={<TeamDashboard />} />
            <Route path="sprint" element={<SprintDashboard />} />
            <Route path="health" element={<HealthDashboard />} />
            <Route path="import" element={<GitLabImport />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </SignedIn>
    </>
  )
}

export default App
