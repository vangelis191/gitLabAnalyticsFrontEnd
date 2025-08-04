import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from './components/ui/provider.tsx'
import { Box } from '@chakra-ui/react'
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <Box padding="10">
        <App />
      </Box>
    </Provider>
</StrictMode>,
)
