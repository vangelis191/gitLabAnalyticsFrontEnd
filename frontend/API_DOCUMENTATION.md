# GitLab Analytics API Documentation

## Overview
This API provides comprehensive Agile analytics for GitLab projects, including time-based velocity analysis, team performance metrics, project health indicators, and advanced analytics features.

## Base URL
```
http://localhost:5001
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Public Endpoints (No Authentication Required):**
- `GET /health` - Health check

**Protected Endpoints (Authentication Required):**
- All analytics endpoints (`/analytics/*`)
- All dashboard endpoints (`/dashboard/*`)
- All data endpoints (`/epics`, `/milestones`)
- GitLab integration (`/import/gitlab`)
- Authentication endpoints (`/auth/*`)

---

## 🔍 **Core Analytics Endpoints**

### 1. Projects
**GET** `/analytics/projects`

Returns all projects.

**Response:**
```json
[
  {
    "id": 1,
    "name": "GitLab Analytics Platform",
    "gitlab_url": "https://gitlab.com",
    "gitlab_token": "***"
  }
]
```

### 2. Milestones
**GET** `/analytics/milestones`

Returns all milestones with their issues.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Sprint 1",
    "start_date": "2025-07-29",
    "due_date": "2025-08-09",
    "issues": [...]
  }
]
```

### 3. Epic Success Analysis
**GET** `/analytics/epic-success`

Returns success status for all epics.

**Response:**
```json
[
  {
    "epic_id": 1,
    "epic_title": "GitLab Analytics Platform",
    "successful": true
  }
]
```

### 4. Milestone Success Analysis
**GET** `/analytics/milestone-success`

Returns success status for all milestones.

**Response:**
```json
[
  {
    "milestone_id": 1,
    "title": "Sprint 1",
    "successful": true
  }
]
```

### 5. Developer Success Analysis
**GET** `/analytics/developer-success`

Returns developer success analysis per milestone.

**Response:**
```json
[
  {
    "milestone_id": 1,
    "milestone_title": "Sprint 1",
    "developers": [
      {
        "developer": "Nikos",
        "weeks": [
          {
            "week": "week1",
            "closed": 2,
            "total": 2,
            "percent": 100.0,
            "successful": true
          }
        ]
      }
    ]
  }
]
```

### 6. Developer Summary
**GET** `/analytics/developer-summary`

Returns overall developer performance summary.

**Response:**
```json
[
  {
    "developer": "Nikos",
    "total_issues": 6,
    "closed_issues": 3,
    "progress_percent": 50.0,
    "successful": true
  }
]
```

### 7. Epic Status
**GET** `/analytics/epic-status`

Returns detailed epic status with milestone breakdown.

**Response:**
```json
{
  "epic_id": 1,
  "epic_title": "GitLab Analytics Platform",
  "start_date": "2025-07-29",
  "due_date": "2026-01-29",
  "successful": true,
  "milestones": [...]
}
```

### 8. Velocity Analysis
**GET** `/analytics/velocity`

Returns velocity per milestone.

**Response:**
```json
[
  {
    "milestone_id": 1,
    "title": "Sprint 1",
    "velocity": 16.5
  }
]
```

### 9. Velocity Statistics
**GET** `/analytics/velocity/stats?backlog=40`

Returns time-based velocity statistics using GitLab time estimates.

**Query Parameters:**
- `backlog` (optional): Remaining hours in backlog for sprint estimation

**Response:**
```json
{
  "sprints": [
    {
      "milestone_id": 1,
      "title": "Sprint 1",
      "total_issues": 4,
      "closed_issues": 2,
      "velocity_hours": 16.5,
      "avg_hours_per_issue": 8.25
    }
  ],
  "total_issues_closed": 10,
  "average_velocity_hours": 20.5,
  "backlog_remaining_hours": 40,
  "estimated_sprints_to_finish_backlog": 2
}
```

### 10. Velocity Chart
**GET** `/analytics/velocity/chart`

Returns velocity chart data for visualization.

**Response:**
```json
{
  "chart_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "sprints": ["Sprint 1", "Sprint 2", "Sprint 3"],
  "velocities": [16.5, 20.0, 18.5]
}
```

### 11. Epic Progress
**GET** `/epic/progress/{epic_id}`

Returns epic progress data for charts.

**Response:**
```json
{
  "epic_id": 1,
  "epic_title": "GitLab Analytics Platform",
  "progress_data": [
    {
      "date": "2025-07-29",
      "estimated_progress": 0,
      "actual_progress": 0
    }
  ]
}
```

### 12. Period Success Check
**GET** `/analytics/is-period-successful?epic_id=1&from_date=2025-07-29&to_date=2025-08-15`

Returns whether an epic was successful in a specific time period.

**Query Parameters:**
- `epic_id`: Epic ID to check
- `from_date`: Start date (YYYY-MM-DD)
- `to_date`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "epic_id": 1,
  "from_date": "2025-07-29",
  "to_date": "2025-08-15",
  "successful": true,
  "total_issues": 4,
  "closed_issues": 4
}
```

---

## 🕒 **GitLab Time-Based Analytics**

### 13. GitLab Velocity Analysis
**GET** `/analytics/gitlab/velocity`

Returns comprehensive time-based velocity metrics.

**Response:**
```json
[
  {
    "milestone_id": 1,
    "milestone_title": "Sprint 1",
    "total_issues": 4,
    "closed_issues": 2,
    "total_estimated_hours": 34.0,
    "total_spent_hours": 14.5,
    "velocity_estimated_hours": 16.0,
    "velocity_spent_hours": 14.5,
    "estimation_accuracy_percent": 90.63,
    "avg_hours_per_issue": 8.0
  }
]
```

### 14. Team Capacity Analysis
**GET** `/analytics/gitlab/team-capacity`

Returns team capacity and workload distribution.

**Response:**
```json
[
  {
    "team_member": "Nikos",
    "total_issues": 6,
    "closed_issues": 3,
    "total_estimated_hours": 48.0,
    "total_spent_hours": 22.0,
    "velocity_hours": 24.0,
    "estimation_accuracy_percent": 91.67,
    "avg_hours_per_issue": 8.0,
    "completion_rate": 50.0
  }
]
```

### 15. Issue Type Analysis
**GET** `/analytics/gitlab/issue-types`

Returns performance analysis by issue type.

**Response:**
```json
[
  {
    "issue_type": "feature",
    "total_count": 6,
    "closed_count": 2,
    "total_estimated_hours": 60.0,
    "total_spent_hours": 20.0,
    "velocity_hours": 20.0,
    "estimation_accuracy_percent": 100.0,
    "avg_hours_per_issue": 10.0,
    "completion_rate": 33.33
  }
]
```

### 16. Priority Analysis
**GET** `/analytics/gitlab/priorities`

Returns performance analysis by priority level.

**Response:**
```json
[
  {
    "priority": "high",
    "total_count": 4,
    "closed_count": 1,
    "total_estimated_hours": 44.0,
    "total_spent_hours": 8.0,
    "velocity_hours": 8.0,
    "estimation_accuracy_percent": 100.0,
    "avg_hours_per_issue": 8.0,
    "completion_rate": 25.0
  }
]
```

### 17. Burndown Chart Data
**GET** `/analytics/gitlab/burndown/{milestone_id}`

Returns burndown chart data for a specific milestone.

**Response:**
```json
{
  "milestone_id": 1,
  "milestone_title": "Sprint 1",
  "total_estimated_hours": 34.0,
  "start_date": "2025-07-29",
  "end_date": "2025-08-09",
  "burndown_data": [
    {
      "date": "2025-07-29",
      "actual_remaining_hours": 34.0,
      "ideal_remaining_hours": 34.0,
      "day_number": 1
    }
  ]
}
```

---

## 📊 **Advanced Analytics**

### 18. Lead Time Analysis
**GET** `/analytics/lead-time`

Returns lead time analysis for all issues.

**Response:**
```json
{
  "total_issues_analyzed": 6,
  "average_lead_time_days": 5.33,
  "median_lead_time_days": 4.0,
  "min_lead_time_days": 2,
  "max_lead_time_days": 12,
  "lead_time_std_dev": 3.27,
  "issues": [...]
}
```

### 19. Throughput Analysis
**GET** `/analytics/throughput?days=30`

Returns throughput analysis for the specified period.

**Query Parameters:**
- `days` (optional): Analysis period in days (default: 30)

**Response:**
```json
{
  "analysis_period_days": 30,
  "start_date": "2025-07-01",
  "end_date": "2025-07-31",
  "total_issues_completed": 6,
  "average_daily_throughput": 0.2,
  "average_weekly_throughput": 1.4,
  "daily_throughput": {...},
  "weekly_throughput": {...}
}
```

### 20. Defect Rate Analysis
**GET** `/analytics/defect-rate`

Returns defect rate analysis.

**Response:**
```json
{
  "total_issues": 12,
  "total_closed_issues": 6,
  "defect_rate_percent": 16.67,
  "closed_defect_rate_percent": 16.67,
  "issue_type_breakdown": {
    "bug": 2,
    "feature": 6,
    "task": 4
  },
  "closed_issue_type_breakdown": {
    "bug": 1,
    "feature": 2,
    "task": 3
  }
}
```

### 21. Velocity Forecasting
**GET** `/analytics/velocity-forecast?sprints_ahead=3`

Returns velocity forecasting for future sprints.

**Query Parameters:**
- `sprints_ahead` (optional): Number of sprints to forecast (default: 3)

**Response:**
```json
{
  "historical_velocities": [16.0, 20.0, 15.0],
  "average_velocity_hours": 17.0,
  "velocity_trend": -0.5,
  "forecasts": [
    {
      "sprint_number": 1,
      "forecasted_velocity_hours": 16.5,
      "confidence_level": "medium"
    }
  ]
}
```

### 22. Team Velocity Trends
**GET** `/analytics/team-velocity-trends`

Returns velocity trends by team member.

**Response:**
```json
{
  "Nikos": {
    "average_velocity_hours": 12.0,
    "velocity_trend": 2.0,
    "sprints_analyzed": 3,
    "velocity_history": [...]
  }
}
```

### 23. Sprint Health Indicators
**GET** `/analytics/sprint-health/{milestone_id}`

Returns comprehensive health indicators for a specific sprint.

**Response:**
```json
{
  "milestone_id": 1,
  "milestone_title": "Sprint 1",
  "health_status": "good",
  "completion_rate_percent": 50.0,
  "estimation_accuracy_percent": 90.63,
  "progress_percentage": 50.0,
  "total_issues": 4,
  "closed_issues": 2,
  "total_estimated_hours": 34.0,
  "total_spent_hours": 14.5,
  "velocity_hours": 16.0,
  "days_elapsed": 5,
  "total_days": 11,
  "days_remaining": 6
}
```

---

## 📈 **Dashboard Endpoints**

### 24. Project Overview Dashboard
**GET** `/dashboard/overview`

Returns comprehensive project overview.

**Response:**
```json
{
  "summary": {
    "total_projects": 1,
    "total_milestones": 3,
    "total_epics": 1,
    "total_issues": 12,
    "total_closed_issues": 6,
    "total_estimated_hours": 102.0,
    "total_spent_hours": 43.0,
    "overall_completion_rate": 50.0,
    "estimation_accuracy": 42.16
  },
  "recent_activity": [...],
  "health_indicators": {
    "completion_rate_status": "needs_attention",
    "estimation_accuracy_status": "needs_attention"
  }
}
```

### 25. Team Dashboard
**GET** `/dashboard/team`

Returns team-focused dashboard.

**Response:**
```json
{
  "team_capacity": [...],
  "team_performance": [...],
  "lead_time_summary": {
    "average_lead_time_days": 5.33,
    "total_issues_analyzed": 6
  },
  "throughput_summary": {
    "total_issues_completed": 6,
    "average_daily_throughput": 0.2,
    "average_weekly_throughput": 1.4
  }
}
```

### 26. Sprint Dashboard
**GET** `/dashboard/sprint`

Returns sprint-focused dashboard.

**Response:**
```json
{
  "current_sprint": {
    "id": 2,
    "title": "Sprint 2",
    "start_date": "2025-08-10",
    "due_date": "2025-08-21",
    "progress": {...}
  },
  "upcoming_sprints": [...],
  "recent_completed_sprints": [...],
  "velocity_summary": {
    "average_velocity_hours": 17.0,
    "total_sprints_analyzed": 3
  },
  "defect_summary": {
    "defect_rate_percent": 16.67,
    "total_issues": 12
  }
}
```

### 27. Project Health Dashboard
**GET** `/dashboard/health`

Returns project health indicators.

**Response:**
```json
{
  "sprint_health": [...],
  "epic_health": [...],
  "overall_health": {
    "health_score": 65.0,
    "health_status": "good",
    "total_sprints": 3,
    "excellent_sprints": 1,
    "good_sprints": 1
  }
}
```

---

## 🔗 **GitLab Integration**

### 28. Import from GitLab API
**POST** `/import/gitlab`

Import data from GitLab API.

**Request Body:**
```json
{
  "project_ids": [123, 456],
  "gitlab_url": "https://gitlab.com",
  "access_token": "your-gitlab-access-token"
}
```

**Response:**
```json
{
  "message": "Import completed",
  "results": [
    {
      "project_id": 123,
      "milestones_imported": 5,
      "issues_imported": 25
    }
  ]
}
```

---

## 🚀 **Project-Specific Endpoints**

### 29. Project Milestones
**GET** `/analytics/projects/{project_id}/milestones`

Returns milestones for a specific project.

### 30. Project Epics
**GET** `/analytics/projects/{project_id}/epics`

Returns epics for a specific project.

### 31. Project Epic Progress
**GET** `/analytics/projects/{project_id}/epic-progress/{epic_id}`

Returns epic progress for a specific project and epic.

### 32. Project Velocity
**GET** `/analytics/projects/{project_id}/velocity`

Returns velocity analysis for a specific project.

### 33. Project Velocity Stats
**GET** `/analytics/projects/{project_id}/velocity/stats`

Returns velocity statistics for a specific project.

### 34. Project Velocity Chart
**GET** `/analytics/projects/{project_id}/velocity/chart`

Returns velocity chart data for a specific project.

### 35. Project GitLab Velocity
**GET** `/analytics/projects/{project_id}/gitlab/velocity`

Returns GitLab velocity analysis for a specific project.

### 36. Project Team Capacity
**GET** `/analytics/projects/{project_id}/gitlab/team-capacity`

Returns team capacity analysis for a specific project.

### 37. Project Issue Types
**GET** `/analytics/projects/{project_id}/gitlab/issue-types`

Returns issue type analysis for a specific project.

### 38. Project Priorities
**GET** `/analytics/projects/{project_id}/gitlab/priorities`

Returns priority analysis for a specific project.

### 39. Project Burndown
**GET** `/analytics/projects/{project_id}/gitlab/burndown/{milestone_id}`

Returns burndown chart data for a specific project and milestone.

### 40. Project Lead Time
**GET** `/analytics/projects/{project_id}/lead-time`

Returns lead time analysis for a specific project.

### 41. Project Throughput
**GET** `/analytics/projects/{project_id}/throughput`

Returns throughput analysis for a specific project.

### 42. Project Defect Rate
**GET** `/analytics/projects/{project_id}/defect-rate`

Returns defect rate analysis for a specific project.

### 43. Project Velocity Forecast
**GET** `/analytics/projects/{project_id}/velocity-forecast`

Returns velocity forecasting for a specific project.

### 44. Project Team Velocity Trends
**GET** `/analytics/projects/{project_id}/team-velocity-trends`

Returns team velocity trends for a specific project.

### 45. Project Sprint Health
**GET** `/analytics/projects/{project_id}/sprint-health/{milestone_id}`

Returns sprint health indicators for a specific project and milestone.

### 46. Project Dashboard Overview
**GET** `/analytics/projects/{project_id}/dashboard/overview`

Returns project overview dashboard for a specific project.

### 47. Project Team Dashboard
**GET** `/analytics/projects/{project_id}/dashboard/team`

Returns team dashboard for a specific project.

### 48. Project Sprint Dashboard
**GET** `/analytics/projects/{project_id}/dashboard/sprint`

Returns sprint dashboard for a specific project.

### 49. Project Health Dashboard
**GET** `/analytics/projects/{project_id}/dashboard/health`

Returns health dashboard for a specific project.

### 50. Project Retrospective
**GET** `/analytics/projects/{project_id}/retrospective/{sprint_id}`

Returns sprint retrospective analysis for a specific project and sprint.

### 51. Project Retrospective Actions
**GET** `/analytics/projects/{project_id}/retrospective/actions/{sprint_id}`

Returns retrospective action items for a specific project and sprint.

### 52. Project Retrospective Trends
**GET** `/analytics/projects/{project_id}/retrospective/trends`

Returns retrospective trends for a specific project.

### 53. Project GitLab Full Data
**GET** `/analytics/projects/{project_id}/gitlab/full-data`

Returns full GitLab data for a specific project.

### 54. Save GitLab Data to Database
**POST** `/analytics/projects/{project_id}/gitlab/save-to-database`

Saves GitLab data to database for a specific project.

### 55. Create Custom Epic
**POST** `/analytics/projects/{project_id}/epics`

Creates a custom epic for a specific project.

### 56. Create Custom Milestone
**POST** `/analytics/projects/{project_id}/milestones`

Creates a custom milestone for a specific project.

### 57. Available Issues
**GET** `/analytics/projects/{project_id}/available-issues`

Returns available issues for a specific project.

---

## 🚀 **Advanced Analytics Features**

### 58. Sprint Planning Capacity
**GET** `/analytics/sprint-planning/capacity`

Returns sprint planning capacity analysis.

### 59. Sprint Planning Commitment
**GET** `/analytics/sprint-planning/commitment`

Returns sprint planning commitment analysis.

### 60. Quality Metrics
**GET** `/analytics/quality/metrics`

Returns quality metrics analysis.

### 61. Technical Debt Impact
**GET** `/analytics/quality/tech-debt-impact`

Returns technical debt impact analysis.

### 62. Sprint Risks
**GET** `/analytics/risks/sprint/{sprint_id}`

Returns risk analysis for a specific sprint.

### 63. Project Risks
**GET** `/analytics/risks/project/{project_id}`

Returns risk analysis for a specific project.

### 64. Sprint Retrospective
**GET** `/analytics/retrospective/{sprint_id}`

Returns sprint retrospective analysis.

### 65. Retrospective Actions
**GET** `/analytics/retrospective/actions/{sprint_id}`

Returns retrospective action items.

### 66. Retrospective Trends
**GET** `/analytics/retrospective/trends`

Returns retrospective trends analysis.

### 67. Business Value Metrics
**GET** `/analytics/business-value/metrics`

Returns business value metrics analysis.

### 68. Backlog Prioritization
**GET** `/analytics/business-value/backlog-prioritization`

Returns backlog prioritization analysis.

### 69. ROI Trends
**GET** `/analytics/business-value/roi-trends`

Returns ROI trends analysis.

### 70. Team Collaboration Analysis
**GET** `/analytics/collaboration/team-analysis`

Returns team collaboration analysis.

### 71. Release Planning Readiness
**GET** `/analytics/release-planning/readiness/{release_id}`

Returns release planning readiness analysis.

---

## 📋 **Basic Data Endpoints**

### 72. Epics List
**GET** `/epics`

Returns all epics.

**Response:**
```json
[
  {
    "id": 1,
    "title": "GitLab Analytics Platform",
    "start_date": "2025-07-29",
    "due_date": "2026-01-29",
    "project_id": 1
  }
]
```

### 73. Milestones List
**GET** `/milestones`

Returns all milestones.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Sprint 1",
    "start_date": "2025-07-29",
    "due_date": "2025-08-09",
    "issues": [...]
  }
]
```

### 74. Health Check
**GET** `/health`

Returns application health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-04T22:15:00Z"
}
```

---

## 🔐 **Authentication Endpoints**

### 75. User Profile
**GET** `/auth/me`

Returns current user profile.

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### 76. Protected Route Example
**GET** `/auth/protected`

Example of a protected route.

**Response:**
```json
{
  "message": "This is a protected route",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

### 77. Optional Auth Route
**GET** `/auth/optional`

Example of an optionally protected route.

**Response:**
```json
{
  "message": "You are authenticated",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

### 78. Generate JWT Token
**POST** `/auth/generate-jwt`

Generates JWT token for development testing.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "user_user_example_com",
    "email": "user@example.com",
    "first_name": "Test",
    "last_name": "User"
  },
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

### 79. Token Verification
**POST** `/auth/verify`

Verifies JWT token.

**Request Body:**
```json
{
  "token": "your-jwt-token"
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "expires_at": 1735689600
}
```

---

## 📊 **Complete API Summary**

### **Total Endpoints: 79**

**Core Analytics (12 endpoints):**
- Projects, Milestones, Epics
- Epic Success & Status
- Milestone Success
- Developer Success & Summary
- Velocity Analysis & Charts
- Epic Progress & Period Success

**GitLab Time-Based Analytics (5 endpoints):**
- GitLab Velocity
- Team Capacity
- Issue Types
- Priorities
- Burndown Charts

**Advanced Analytics (6 endpoints):**
- Lead Time Analysis
- Throughput Analysis
- Defect Rate Analysis
- Velocity Forecasting
- Team Velocity Trends
- Sprint Health Indicators

**Dashboard Endpoints (4 endpoints):**
- Project Overview
- Team Dashboard
- Sprint Dashboard
- Health Dashboard

**Project-Specific Endpoints (29 endpoints):**
- All core analytics with project context
- All GitLab analytics with project context
- All advanced analytics with project context
- All dashboard endpoints with project context
- Project-specific retrospective analysis
- GitLab integration for specific projects
- Custom epic/milestone creation

**Advanced Analytics Features (14 endpoints):**
- Sprint Planning (Capacity & Commitment)
- Quality Metrics & Technical Debt
- Risk Analysis (Sprint & Project)
- Retrospective Analysis & Trends
- Business Value Metrics & ROI
- Team Collaboration Analysis
- Release Planning Readiness

**Basic Data (3 endpoints):**
- Epics List
- Milestones List
- Health Check

**Authentication (5 endpoints):**
- User Profile
- Protected Routes
- Optional Auth
- JWT Generation
- Token Verification

**GitLab Integration (1 endpoint):**
- Import from GitLab API

---

## 📊 **Key Metrics Explained**

- **Velocity**: Hours of work completed per sprint
- **Lead Time**: Days from issue creation to completion
- **Throughput**: Number of issues completed per time period
- **Defect Rate**: Percentage of issues that are bugs
- **Estimation Accuracy**: How well time estimates match actual time spent
- **Completion Rate**: Percentage of issues completed in a sprint
- **Team Capacity**: Available hours per team member
- **Sprint Health**: Overall sprint performance indicators

---

## 🔧 **Error Handling**

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized (missing or invalid JWT)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a descriptive message:
```json
{
  "error": "Milestone not found"
}
```

---

## 🚀 **Getting Started**

1. **Start the application:**
   ```bash
   python3 app.py
   ```

2. **Test the API:**
   ```bash
   # Test velocity analysis
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/analytics/velocity/stats?backlog=40
   
   # Test dashboard
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/dashboard/overview
   ```

3. **Import from GitLab:**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -H "Authorization: Bearer <your-jwt-token>" \
        -d '{"project_ids": [123], "access_token": "your-token"}' \
        http://localhost:5001/import/gitlab
   ```

4. **Generate JWT for testing:**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -d '{"email": "test@example.com", "password": "password123"}' \
        http://localhost:5001/auth/generate-jwt
   ```
