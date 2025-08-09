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

### 14. Team Capacity Analysis (with Project Filter)
**GET** `/analytics/team-capacity?project_id=1`

Returns team capacity analysis with optional project filtering.

**Query Parameters:**
- `project_id` (optional): Filter by specific project ID

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

Calculates team capacity for sprint planning using dynamic developer settings.

**Query Parameters:**
- `team_members` (required): Team member names (can be multiple)
- `sprint_duration` (optional): Sprint duration in weeks (default: 2)
- `project_id` (optional): Project ID for context

**Example:**
```
GET /analytics/sprint-planning/capacity?team_members=Nikos&team_members=Maria&sprint_duration=2&project_id=1
```

**Response:**
```json
{
  "Nikos": {
    "historical_velocity": 24.0,
    "available_hours": 68.0,
    "recommended_capacity": 24.0,
    "developer_config": {
      "working_hours_per_day": 8.0,
      "working_days_per_week": 5,
      "availability_factor": 0.85,
      "experience_level": "senior",
      "hourly_rate": 45.0
    },
    "working_hours_per_day": 8.0,
    "working_days_per_week": 5,
    "availability_factor": 0.85,
    "provider_name": "gitlab",
    "external_username": "Nikos"
  },
  "Maria": {
    "historical_velocity": 18.0,
    "available_hours": 60.0,
    "recommended_capacity": 18.0,
    "developer_config": {
      "working_hours_per_day": 7.5,
      "working_days_per_week": 5,
      "availability_factor": 0.8,
      "experience_level": "intermediate",
      "hourly_rate": 35.0
    },
    "working_hours_per_day": 7.5,
    "working_days_per_week": 5,
    "availability_factor": 0.8,
    "provider_name": "gitlab",
    "external_username": "Maria"
  }
}
```

### 59. Sprint Planning Commitment
**GET** `/analytics/sprint-planning/commitment`

Predicts realistic sprint commitment based on team capacity and historical data.

**Query Parameters:**
- `team_members` (required): Team member names (can be multiple)
- `sprint_duration` (optional): Sprint duration in weeks (default: 2)
- `project_id` (optional): Project ID for context

**Example:**
```
GET /analytics/sprint-planning/commitment?team_members=Nikos&team_members=Maria&sprint_duration=2&project_id=1
```

**Response:**
```json
{
  "total_capacity": 42.0,
  "total_estimated_effort": 0,
  "recommended_commitment": 0,
  "commitment_probability": 1.0,
  "risk_level": "low",
  "accuracy_factor": 0.9,
  "team_breakdown": {
    "Nikos": {
      "capacity": 24.0,
      "utilization": "optimal"
    },
    "Maria": {
      "capacity": 18.0,
      "utilization": "optimal"
    }
  }
}
```

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

## 👥 **Developer Management Endpoints**

### 80. Get All Developers
**GET** `/developers`

Returns all active developers.

**Query Parameters:**
- `project_id` (optional): Filter by specific project ID
- `team_name` (optional): Filter by team name

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nikos",
    "email": "nikos@company.com",
    "provider_type": "gitlab",
    "provider_username": "nikos.gitlab",
    "working_hours_per_day": 8.0,
    "working_days_per_week": 5,
    "availability_factor": 0.85,
    "experience_level": "senior",
    "hourly_rate": 45.0,
    "team_name": "Backend Team",
    "project_id": 1,
    "is_active": true
  }
]
```

### 81. Get Developer by Name
**GET** `/developers/{name}`

Returns specific developer information.

**Response:**
```json
{
  "id": 1,
  "name": "Nikos",
  "email": "nikos@company.com",
  "provider_type": "gitlab",
  "provider_username": "nikos.gitlab",
  "provider_user_id": "123",
  "provider_data": {...},
  "working_hours_per_day": 8.0,
  "working_days_per_week": 5,
  "availability_factor": 0.85,
  "experience_level": "senior",
  "hourly_rate": 45.0,
  "team_name": "Backend Team",
  "project_id": 1,
  "is_active": true,
  "start_date": "2025-01-01",
  "end_date": null
}
```

### 82. Create New Developer
**POST** `/developers`

Creates a new developer.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "provider_type": "gitlab",
  "provider_username": "john.doe",
  "working_hours_per_day": 8.0,
  "working_days_per_week": 5,
  "availability_factor": 0.8,
  "experience_level": "intermediate",
  "hourly_rate": 35.0,
  "team_name": "Frontend Team",
  "project_id": 1
}
```

**Response:**
```json
{
  "message": "Developer created successfully",
  "developer": {
    "id": 4,
    "name": "John Doe",
    "email": "john@company.com",
    "working_hours_per_day": 8.0,
    "working_days_per_week": 5,
    "availability_factor": 0.8,
    "experience_level": "intermediate",
    "hourly_rate": 35.0,
    "team_name": "Frontend Team",
    "project_id": 1
  }
}
```

### 83. Update Developer Information
**PUT** `/developers/{developer_id}`

Updates developer information.

**Request Body:**
```json
{
  "working_hours_per_day": 7.5,
  "availability_factor": 0.9,
  "hourly_rate": 40.0
}
```

**Response:**
```json
{
  "message": "Developer updated successfully",
  "developer": {
    "id": 1,
    "name": "Nikos",
    "working_hours_per_day": 7.5,
    "availability_factor": 0.9,
    "hourly_rate": 40.0
  }
}
```

### 84. Get Developer Capacity
**GET** `/developers/{name}/capacity`

Returns developer capacity configuration and calculations.

**Query Parameters:**
- `sprint_duration` (optional): Sprint duration in weeks (default: 2)

**Response:**
```json
{
  "developer_name": "Nikos",
  "sprint_duration_weeks": 2,
  "capacity_config": {
    "working_hours_per_day": 8.0,
    "working_days_per_week": 5,
    "availability_factor": 0.85,
    "experience_level": "senior",
    "hourly_rate": 45.0
  },
  "calculated_capacity": {
    "total_working_hours": 80.0,
    "available_hours": 68.0,
    "daily_capacity": 6.8,
    "weekly_capacity": 34.0
  }
}
```

### 85. Get All Teams
**GET** `/developers/teams`

Returns all unique team names.

**Response:**
```json
[
  "Backend Team",
  "Frontend Team",
  "QA Team"
]
```

### 86. Bulk Capacity Calculation
**POST** `/developers/capacity/bulk`

Calculates capacity for multiple developers.

**Request Body:**
```json
{
  "team_members": ["Nikos", "Maria", "Kostas"],
  "sprint_duration": 2
}
```

**Response:**
```json
{
  "team_capacity": {
    "Nikos": {
      "historical_velocity": 24.0,
      "available_hours": 68.0,
      "recommended_capacity": 24.0,
      "working_hours_per_day": 8.0,
      "working_days_per_week": 5,
      "availability_factor": 0.85
    }
  },
  "sprint_duration": 2,
  "total_capacity": 158.0,
  "total_available_hours": 178.0
}
```

---

## 🔗 **Provider Mapping Endpoints**

### 87. Get Provider Mappings
**GET** `/provider-mappings/{provider_name}`

Returns all mappings for a specific provider.

**Response:**
```json
{
  "provider": "gitlab",
  "mappings": {
    "nikos.gitlab": "Nikos",
    "maria.gitlab": "Maria",
    "kostas.gitlab": "Kostas"
  },
  "total_mappings": 3
}
```

### 88. Create Provider Mapping
**POST** `/provider-mappings/{provider_name}/map`

Creates mapping between developer and external username.

**Request Body:**
```json
{
  "developer_name": "Nikos",
  "external_username": "nikos.gitlab"
}
```

**Response:**
```json
{
  "message": "Successfully mapped nikos.gitlab to Nikos for gitlab",
  "provider": "gitlab",
  "developer_name": "Nikos",
  "external_username": "nikos.gitlab"
}
```

### 89. Suggest Mappings
**POST** `/provider-mappings/{provider_name}/suggest`

Suggests mappings for external usernames.

**Request Body:**
```json
{
  "external_usernames": ["john.doe", "jane.smith", "unknown.user"]
}
```

**Response:**
```json
{
  "provider": "gitlab",
  "suggestions": {
    "john.doe": ["John", "John Doe"],
    "jane.smith": ["Jane", "Jane Smith"]
  },
  "unmapped_users": ["john.doe", "jane.smith"]
}
```

### 90. Auto-Map from Data
**POST** `/provider-mappings/{provider_name}/auto-map`

Auto-maps developers from existing issues data.

**Request Body:**
```json
{
  "issues_data": [
    {"assignee": "nikos.gitlab", "reporter": "maria.gitlab", "title": "Task 1"},
    {"assignee": "maria.gitlab", "reporter": "kostas.gitlab", "title": "Task 2"}
  ]
}
```

**Response:**
```json
{
  "provider": "gitlab",
  "auto_mappings": {
    "nikos.gitlab": "Nikos",
    "maria.gitlab": "Maria",
    "kostas.gitlab": "Kostas"
  },
  "mapped_count": 3,
  "message": "Successfully auto-mapped 3 users for gitlab"
}
```

### 91. Resolve External User
**GET** `/provider-mappings/{provider_name}/resolve/{external_username}`

Resolves external username to developer.

**Response:**
```json
{
  "provider": "gitlab",
  "external_username": "nikos.gitlab",
  "resolved_developer": {
    "id": 1,
    "name": "Nikos",
    "email": "nikos@company.com",
    "working_hours_per_day": 8.0,
    "working_days_per_week": 5,
    "availability_factor": 0.85,
    "experience_level": "senior",
    "team_name": "Backend Team"
  },
  "all_provider_mappings": {
    "gitlab": "nikos.gitlab",
    "jira": "nikos.jira",
    "azure": "n.petrou"
  }
}
```

### 92. Bulk Import Mappings
**POST** `/provider-mappings/bulk-import`

Bulk imports mappings from various providers.

**Request Body:**
```json
{
  "gitlab": {
    "Nikos": "nikos.gitlab",
    "Maria": "maria.gitlab"
  },
  "jira": {
    "Nikos": "nikos.jira",
    "Maria": "maria.jira"
  },
  "azure": {
    "Nikos": "n.petrou",
    "Maria": "m.kara"
  }
}
```

**Response:**
```json
{
  "message": "Bulk import completed",
  "results": {
    "gitlab": {
      "successful_mappings": [
        {"developer_name": "Nikos", "external_username": "nikos.gitlab"},
        {"developer_name": "Maria", "external_username": "maria.gitlab"}
      ],
      "failed_mappings": []
    },
    "jira": {
      "successful_mappings": [...],
      "failed_mappings": []
    }
  }
}
```

### 93. Get All Developers with Mappings
**GET** `/provider-mappings/all-developers`

Returns all developers with their provider mappings.

**Response:**
```json
{
  "developers": [
    {
      "id": 1,
      "name": "Nikos",
      "email": "nikos@company.com",
      "team_name": "Backend Team",
      "provider_mappings": {
        "gitlab": "nikos.gitlab",
        "jira": "nikos.jira",
        "azure": "n.petrou"
      },
      "supported_providers": ["gitlab", "jira", "azure"]
    }
  ],
  "total_developers": 3
}
```

---

## 🔄 **Developer Import & Provider Integration Endpoints**

### 94. Import Developers from Project Provider
**POST** `/projects/{project_id}/import-developers`

Imports developers from the project's configured provider (GitLab, Azure, etc.).

**Response:**
```json
{
  "message": "Import completed successfully",
  "project_id": 1,
  "provider_type": "gitlab",
  "imported_count": 5,
  "updated_count": 2,
  "skipped_count": 1,
  "total_processed": 8,
  "errors": []
}
```

### 95. Import Developers with Custom Provider Configuration
**POST** `/projects/{project_id}/import-developers/custom`

Imports developers using custom provider configuration (without updating project settings).

**Request Body:**
```json
{
  "provider_type": "gitlab",
  "provider_url": "https://gitlab.company.com",
  "access_token": "your-gitlab-token",
  "external_project_id": "123"
}
```

**Response:**
```json
{
  "message": "Import completed successfully",
  "project_id": 1,
  "provider_type": "gitlab",
  "imported_count": 5,
  "updated_count": 0,
  "skipped_count": 1,
  "total_processed": 6,
  "errors": []
}
```

### 96. Update Project Provider Configuration
**PUT** `/projects/{project_id}/provider-config`

Updates the project's provider configuration.

**Request Body:**
```json
{
  "provider_type": "gitlab",
  "provider_url": "https://gitlab.company.com",
  "access_token": "your-gitlab-token",
  "provider_config": {
    "project_id": "123",
    "branch": "main"
  },
  "company_name": "Company Inc",
  "company_domain": "company.com"
}
```

**Response:**
```json
{
  "message": "Provider configuration updated successfully",
  "project_id": 1
}
```

### 97. Get Project Provider Configuration
**GET** `/projects/{project_id}/provider-config`

Returns the project's provider configuration (access token is masked).

**Response:**
```json
{
  "id": 1,
  "name": "Project Name",
  "provider_type": "gitlab",
  "provider_url": "https://gitlab.company.com",
  "provider_token": "***",
  "provider_config": {
    "project_id": "123",
    "branch": "main"
  },
  "company_name": "Company Inc",
  "company_domain": "company.com"
}
```

### 98. Get Import Status
**GET** `/projects/{project_id}/import-status`

Returns the current import status and provider configuration for a project.

**Response:**
```json
{
  "project_id": 1,
  "project_name": "Project Name",
  "provider_type": "gitlab",
  "provider_url": "https://gitlab.company.com",
  "provider_configured": true,
  "provider_connection_status": true,
  "total_developers": 8,
  "active_developers": 7,
  "company_name": "Company Inc",
  "company_domain": "company.com"
}
```

### 99. Get Available Providers
**GET** `/providers/available`

Returns list of supported providers.

**Response:**
```json
{
  "providers": [
    {
      "type": "gitlab",
      "name": "GitLab",
      "description": "GitLab project management and Git repository hosting",
      "default_url": "https://gitlab.com",
      "supports": ["users", "projects", "issues", "milestones"]
    },
    {
      "type": "azure",
      "name": "Azure DevOps",
      "description": "Microsoft Azure DevOps Services",
      "default_url": "https://dev.azure.com",
      "supports": ["users", "projects", "work_items", "iterations"]
    }
  ],
  "total_providers": 2
}
```

### 100. Test Provider Connection
**POST** `/projects/{project_id}/test-provider-connection`

Tests connection to the project's configured provider or custom configuration.

**Request Body (Optional - for testing custom config):**
```json
{
  "provider_type": "gitlab",
  "provider_url": "https://gitlab.company.com",
  "access_token": "your-gitlab-token"
}
```

**Response:**
```json
{
  "connection_status": true,
  "provider_type": "gitlab",
  "provider_url": "https://gitlab.company.com"
}
```

### 101. Preview Import
**POST** `/projects/{project_id}/preview-import`

Previews developers that would be imported without actually importing them.

**Request Body:**
```json
{
  "provider_type": "gitlab",
  "provider_url": "https://gitlab.company.com",
  "access_token": "your-gitlab-token",
  "external_project_id": "123"
}
```

**Response:**
```json
{
  "preview_users": [
    {
      "username": "john.doe",
      "name": "John Doe",
      "email": "john@company.com",
      "is_active": true,
      "will_be_imported": true
    },
    {
      "username": "jane.smith",
      "name": "Jane Smith",
      "email": "jane@company.com",
      "is_active": true,
      "will_be_imported": true
    }
  ],
  "total_users_found": 10,
  "active_users_count": 8,
  "inactive_users_count": 2,
  "provider_type": "gitlab"
}
```

### 102. Sync Developers
**POST** `/projects/{project_id}/sync-developers`

Syncs existing developers with fresh data from the provider.

**Response:**
```json
{
  "message": "Developers synced successfully",
  "project_id": 1,
  "provider_type": "gitlab",
  "imported_count": 0,
  "updated_count": 5,
  "skipped_count": 1,
  "total_processed": 6,
  "sync_operation": true,
  "errors": []
}
```

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

### **Total Endpoints: 102**

**Core Analytics (12 endpoints):**
- Projects, Milestones, Epics
- Epic Success & Status
- Milestone Success
- Developer Success & Summary
- Velocity Analysis & Charts
- Epic Progress & Period Success

**GitLab Time-Based Analytics (5 endpoints):**
- Team Capacity (with Project Filter)
- GitLab Velocity
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

**Developer Management (7 endpoints):**
- Get All Developers (with filters)
- Get/Create/Update Developer
- Developer Capacity Calculations
- Team Management
- Bulk Capacity Operations

**Provider Mapping (7 endpoints):**
- Provider-specific Mappings
- Auto-mapping from Data
- Bulk Import/Export
- User Resolution
- Mapping Suggestions

**Developer Import & Provider Integration (9 endpoints):**
- Import Developers from Project Provider
- Custom Provider Import
- Provider Configuration Management
- Import Status & Preview
- Available Providers
- Connection Testing
- Developer Sync Operations

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

5. **Test Developer Management:**
   ```bash
   # Get all developers
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/developers
   
   # Get developer capacity
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/developers/Nikos/capacity?sprint_duration=2
   
   # Sprint planning with dynamic settings
   curl -H "Authorization: Bearer <your-jwt-token>" \
        "http://localhost:5001/analytics/sprint-planning/capacity?team_members=Nikos&team_members=Maria&sprint_duration=2&project_id=1"
   ```

6. **Test Provider Mappings:**
   ```bash
   # Get GitLab mappings
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/provider-mappings/gitlab
   
   # Resolve external user
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/provider-mappings/gitlab/resolve/nikos.gitlab
   ```

7. **Test Developer Import & Provider Integration:**
   ```bash
   # Get available providers
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/providers/available
   
   # Update project provider config
   curl -X PUT -H "Content-Type: application/json" \
        -H "Authorization: Bearer <your-jwt-token>" \
        -d '{"provider_type": "gitlab", "provider_url": "https://gitlab.com", "access_token": "your-token"}' \
        http://localhost:5001/projects/1/provider-config
   
   # Test provider connection
   curl -X POST -H "Content-Type: application/json" \
        -H "Authorization: Bearer <your-jwt-token>" \
        -d '{"provider_type": "gitlab", "provider_url": "https://gitlab.com", "access_token": "your-token"}' \
        http://localhost:5001/projects/1/test-provider-connection
   
   # Preview import
   curl -X POST -H "Content-Type: application/json" \
        -H "Authorization: Bearer <your-jwt-token>" \
        -d '{"provider_type": "gitlab", "provider_url": "https://gitlab.com", "access_token": "your-token"}' \
        http://localhost:5001/projects/1/preview-import
   
   # Import developers
   curl -X POST -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/projects/1/import-developers
   
   # Check import status
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:5001/projects/1/import-status
   ```

---

## 🏗️ **Architecture & Future Microservices**

### **Current Monolithic Structure**
```
Flask App (Python)
├── Analytics Service (Core calculations)
├── Developer Management (Local database)
├── Provider Integration (GitLab, Azure, etc.)
├── Project Management
└── Authentication (Clerk)
```

### **Future Microservices Architecture**
```
API Gateway
├── Analytics Service (Python/Flask) - Calculations only
├── User Management Service (.NET) - Developer & provider management
├── Project Management Service (.NET) - Projects, issues, milestones
├── Provider Integration Service (.NET) - GitLab, Azure, Jira APIs
└── Authentication Service (Clerk/Azure AD)
```

### **Migration Strategy**
The current API is designed for easy migration to microservices:

1. **Service Abstraction Layer**: All external dependencies go through service interfaces
2. **Repository Pattern**: Database access is abstracted and can be replaced with HTTP calls
3. **Configuration-based Switching**: `MICROSERVICES_MODE` flag to switch between local DB and external APIs
4. **Provider-agnostic Design**: Generic interfaces that work with any provider (GitLab, Azure, Jira)

### **Developer Workflow**
```
1. Setup Project with Provider (GitLab/Azure/Jira)
2. Import Developers from Provider API
3. Customize Developer Settings (hours, availability, rates)
4. Use in Analytics (capacity planning, sprint commitment)
5. Sync changes back to provider (future feature)
```

### **Key Features for Frontend Integration**
- **Dynamic Developer Settings**: Real-time capacity calculations based on actual developer configurations
- **Provider Flexibility**: Support for multiple project management tools (GitLab, Azure DevOps)
- **Developer Import**: Automatic import of developers from external providers with customizable settings
- **Provider Configuration**: Project-level provider configuration with connection testing
- **Sprint Planning**: Advanced capacity and commitment predictions using real developer data
- **Import Preview**: Preview developers before importing with detailed information
- **Real-time Sync**: Keep developer data synchronized with external providers
- **Connection Testing**: Validate provider credentials and connectivity
- **Team Management**: Organize developers by teams and projects
- **Historical Data**: Track changes over time for better predictions
- **Microservices Ready**: Architecture designed for easy migration to .NET microservices
