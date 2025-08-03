# Frontend Project Structure

frontend/
├── public/                     # Static files (e.g., favicon, images)
├── src/
│   ├── assets/                 # Images, logos, global styles
│   ├── components/             # Reusable UI components
│   │   └── layout/             # Header, Footer, Sidebar, etc.
│   ├── features/               # Feature-based folders (e.g., Velocity, Epics)
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── useDashboardData.ts
│   │   ├── velocity/
│   │   │   ├── VelocityChart.tsx
│   │   │   └── velocityService.ts
│   │   ├── epic/
│   │   │   ├── EpicProgress.tsx
│   │   │   └── epicService.ts
│   ├── hooks/                  # Shared custom hooks
│   ├── services/               # API fetchers (axios, fetch) that call Python backend
│   │   ├── api.ts              # Common API client config
│   ├── pages/                  # Routed pages (for React Router)
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   └── NotFound.tsx
│   ├── router/                 # Router configuration
│   │   └── index.tsx
│   ├── utils/                  # Helper functions (date formatting, etc.)
│   ├── App.tsx                 # Main App component (already using Clerk)
│   ├── main.tsx                # Vite entry point
│   └── index.css               # Global styles
├── .env                        # Environment variables
├── package.json
└── vite.config.ts
