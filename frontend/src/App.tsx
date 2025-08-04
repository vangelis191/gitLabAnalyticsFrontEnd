import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';              // ΤΩΡΑ acting as Layout
import Dashboard from './features/dashboard/DashBoard';
import Velocity from './features/velocity/VelocityChart';
import EpicProgress from './features/epic/EpicProgress';
import NotFound from './pages/NotFound';
   // περιεχόμενο της αρχικής (ή βάλε Dashboard σαν index)

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
          {/* Home ως GLOBAL LAYOUT */}
          <Route element={<Home />}>
            {/* index route: τι να δείχνει στο "/" */}
            <Route index element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/velocity" element={<Velocity />} />
            <Route path="/epics" element={<EpicProgress />} />
          </Route>

          {/* Σελίδες εκτός layout, αν υπάρχουν */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SignedIn>
    </>
  )
}

export default App;
