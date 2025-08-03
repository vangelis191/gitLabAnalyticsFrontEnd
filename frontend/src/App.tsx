import './App.css'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import Home from './pages/Home';
import { UserButton } from '@clerk/clerk-react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './features/dashboard/DashBoard';
import Velocity from './features/velocity/VelocityChart';
import EpicProgress from './features/epic/EpicProgress';
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
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/velocity" element={<Velocity />} />
          <Route path="/epics" element={<EpicProgress />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SignedIn>
    </>
  )
}

export default App
