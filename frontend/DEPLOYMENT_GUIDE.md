# 🚀 Deployment Guide - GitLab Analytics

## 📋 Overview
This guide covers deploying the GitLab Analytics application:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Contabo/Azure (Python FastAPI)
- **Authentication**: Clerk

---

## 🌐 Frontend Deployment - Vercel

### Prerequisites
- Vercel account
- GitHub repository connected
- Clerk production keys

### Step 1: Prepare Frontend
```bash
cd frontend
npm install
npm run build
```

### Step 2: Deploy to Vercel
1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend` directory as root

2. **Environment Variables** (in Vercel Dashboard):
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```

3. **Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 3: Configure Clerk
1. **Update Clerk Settings**:
   - Add your Vercel domain to Clerk allowed origins
   - Update redirect URLs in Clerk dashboard
   - Set production publishable key

---

## 🔧 Backend Deployment Options

### Option A: Contabo VPS (Recommended for Cost)

#### Prerequisites
- Contabo VPS (Ubuntu 22.04)
- Domain name
- SSL certificate

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python, Node.js, Nginx
sudo apt install python3 python3-pip python3-venv nginx certbot python3-certbot-nginx -y

# Install Node.js (for PM2)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 2: Deploy Backend
```bash
# Clone repository
git clone https://github.com/your-repo/gitlab-analytics-backend.git
cd gitlab-analytics-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="your_database_url"
export SECRET_KEY="your_secret_key"
export CLERK_SECRET_KEY="your_clerk_secret_key"

# Test the application
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Step 3: Configure Nginx
```nginx
# /etc/nginx/sites-available/gitlab-analytics
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Step 4: SSL Certificate
```bash
sudo ln -s /etc/nginx/sites-available/gitlab-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com
```

#### Step 5: Process Management (PM2)
```bash
# Install PM2
sudo npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gitlab-analytics-backend',
    script: 'uvicorn',
    args: 'main:app --host 0.0.0.0 --port 8000',
    cwd: '/path/to/your/backend',
    env: {
      DATABASE_URL: 'your_database_url',
      SECRET_KEY: 'your_secret_key',
      CLERK_SECRET_KEY: 'your_clerk_secret_key'
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: Azure App Service

#### Prerequisites
- Azure account
- Azure CLI installed

#### Step 1: Create Azure Resources
```bash
# Login to Azure
az login

# Create resource group
az group create --name gitlab-analytics-rg --location westeurope

# Create App Service plan
az appservice plan create --name gitlab-analytics-plan --resource-group gitlab-analytics-rg --sku B1 --is-linux

# Create web app
az webapp create --name gitlab-analytics-backend --resource-group gitlab-analytics-rg --plan gitlab-analytics-plan --runtime "PYTHON:3.11"
```

#### Step 2: Configure Environment Variables
```bash
az webapp config appsettings set --name gitlab-analytics-backend --resource-group gitlab-analytics-rg --settings \
  DATABASE_URL="your_database_url" \
  SECRET_KEY="your_secret_key" \
  CLERK_SECRET_KEY="your_clerk_secret_key"
```

#### Step 3: Deploy Code
```bash
# Deploy from local directory
az webapp deployment source config-local-git --name gitlab-analytics-backend --resource-group gitlab-analytics-rg

# Or deploy from GitHub
az webapp deployment source config --name gitlab-analytics-backend --resource-group gitlab-analytics-rg --repo-url https://github.com/your-repo/backend --branch main --manual-integration
```

---

## 🔐 Security Configuration

### CORS Settings
Update your backend CORS configuration:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.vercel.app",
        "http://localhost:5173"  # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables Checklist
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` (Frontend)
- [ ] `CLERK_SECRET_KEY` (Backend)
- [ ] `DATABASE_URL` (Backend)
- [ ] `SECRET_KEY` (Backend)
- [ ] `VITE_API_BASE_URL` (Frontend)

---

## 🧪 Testing Deployment

### Frontend Tests
```bash
# Test build locally
cd frontend
npm run build
npm run preview

# Test production build
curl https://your-frontend-domain.vercel.app
```

### Backend Tests
```bash
# Test API endpoints
curl https://your-backend-domain.com/health
curl https://your-backend-domain.com/analytics/projects
```

### Integration Tests
1. **Authentication Flow**:
   - Sign up/in with Clerk
   - Verify token handling
   - Test protected routes

2. **API Integration**:
   - Test all analytics endpoints
   - Verify CORS headers
   - Check error handling

---

## 📊 Monitoring & Maintenance

### Vercel Monitoring
- Built-in analytics
- Performance monitoring
- Error tracking

### Backend Monitoring
```bash
# PM2 monitoring (Contabo)
pm2 monit
pm2 logs

# Azure monitoring
az webapp log tail --name gitlab-analytics-backend --resource-group gitlab-analytics-rg
```

### Database Monitoring
- Set up database backups
- Monitor performance
- Configure alerts

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check CORS configuration
   - Verify domain origins
   - Test with Postman

2. **Authentication Issues**:
   - Verify Clerk keys
   - Check token handling
   - Test auth flow

3. **Build Failures**:
   - Check Node.js version
   - Verify dependencies
   - Review build logs

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Contabo Documentation](https://contabo.com/en/docs/)
- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Clerk Documentation](https://clerk.com/docs)

---

## 📈 Performance Optimization

### Frontend
- Enable Vercel edge caching
- Optimize bundle size
- Use lazy loading

### Backend
- Implement caching (Redis)
- Database query optimization
- Load balancing (if needed)

---

**🎉 Your GitLab Analytics application is now ready for production deployment!** 