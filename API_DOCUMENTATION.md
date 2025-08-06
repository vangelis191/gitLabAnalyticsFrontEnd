# GitLab Analytics API Documentation

## Overview
This API provides comprehensive Agile analytics for GitLab projects, including time-based velocity analysis, team performance metrics, and project health indicators.

## Base URL
```
http://localhost:5001
```

## Authentication
Most endpoints require Clerk authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Public Endpoints (No Authentication Required):**
- `GET /health` - Health check
- `GET /auth/optional` - Optional authentication example

**Protected Endpoints (Authentication Required):**
- All analytics endpoints (`/analytics/*`)
- All dashboard endpoints (`/dashboard/*`)
- All data endpoints (`/epics`, `/milestones`)
- GitLab integration (`/import/gitlab`)
- Authentication endpoints (`/auth/me`, `/auth/protected`, `/auth/verify`)

---

## 🔍 **Core Analytics Endpoints**

### 1. Velocity Analysis
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

### 1.1. Velocity Chart
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

### 1.2. Epic Progress
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

### 1.3. Period Success Check
**GET** `/analytics/is-period-successful?epic_id=1&from_date=2025-07-29&to_date=2025-08-15`

Returns whether an epic was successful in a specific time period.

**Query Parameters:**
- `epic_id`: Epic ID to check

---

## 🔄 **Retrospective Analytics Endpoints**

### 1. Sprint Retrospective Analysis
**GET** `/analytics/retrospective/{sprint_id}`

Analyzes a sprint for retrospective insights including completion rates, estimation accuracy, and improvement suggestions.

**Path Parameters:**
- `sprint_id`: ID of the sprint to analyze

**Query Parameters:**
- `project_id` (optional): Project ID for project-specific analysis

**Response:**
```json
{
  "sprint_id": 1,
  "sprint_title": "Sprint 1 - Foundation",
  "completion_rate": 85.5,
  "estimation_accuracy": 78.2,
  "what_went_well": [
    "High sprint completion rate achieved",
    "Good estimation accuracy maintained",
    "Even workload distribution across team"
  ],
  "what_could_improve": [
    "Sprint completion rate below target",
    "Estimation accuracy needs improvement"
  ],
  "action_items": [
    "Reduce sprint commitment by 20%",
    "Add 25% buffer to time estimates"
  ],
  "team_sentiment": "Positive",
  "process_improvements": [
    "Implement stricter change control process",
    "Add more detailed acceptance criteria"
  ],
  "metrics": {
    "total_issues": 15,
    "closed_issues": 12,
    "estimated_hours": 120,
    "spent_hours": 135,
    "average_issue_completion_time": 3.2,
    "bug_count": 2,
    "story_count": 8,
    "task_count": 5
  }
}
```

### 1.1. Retrospective Trends
**GET** `/analytics/retrospective/trends?sprints_count=5`

Returns retrospective trends across multiple sprints.

**Query Parameters:**
- `project_id` (optional): Project ID for project-specific analysis
- `sprints_count` (optional): Number of sprints to analyze (default: 5)

**Response:**
```json
{
  "completion_rates": [85.5, 78.2, 92.1, 88.7, 90.3],
  "estimation_accuracies": [78.2, 72.5, 85.1, 79.8, 82.4],
  "sprint_titles": ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"],
  "overall_trend": "improving"
}
```

### 1.2. Action Item Effectiveness
**POST** `/analytics/retrospective/actions/{sprint_id}`

Tracks the effectiveness of retrospective action items.

**Path Parameters:**
- `sprint_id`: ID of the sprint

**Request Body:**
```json
{
  "action_items": [
    "Reduce sprint commitment by 20%",
    "Add 25% buffer to time estimates"
  ],
  "follow_up_sprints": [2, 3, 4]
}
```

**Response:**
```json
{
  "sprint_id": 1,
  "action_items": ["Reduce sprint commitment by 20%", "Add 25% buffer to time estimates"],
  "effectiveness": {
    "Reduce sprint commitment by 20%": {
      "status": "implemented",
      "effectiveness_score": 75.0,
      "follow_up_needed": false,
      "recommendations": ["Action is working but could be improved"]
    }
  },
  "overall_effectiveness": 75.0
}
```

### 1.3. Project-Specific Retrospective Analysis
**GET** `/analytics/projects/{project_id}/retrospective/{sprint_id}`

Project-specific sprint retrospective analysis.

**Path Parameters:**
- `project_id`: Project ID
- `sprint_id`: Sprint ID

**Response:** Same as general retrospective analysis

### 1.4. Project-Specific Retrospective Trends
**GET** `/analytics/projects/{project_id}/retrospective/trends?sprints_count=5`

Project-specific retrospective trends.

**Path Parameters:**
- `project_id`: Project ID

**Query Parameters:**
- `sprints_count` (optional): Number of sprints to analyze

**Response:** Same as general retrospective trends
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

### 2. Epic Success Analysis
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

### 2.1. Developer Success Analysis
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

### 2.2. Developer Summary
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

### 2.3. Epic Status
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
  "milestones": [
    {
      "milestone_id": 1,
      "title": "Sprint 1",
      "total_issues": 4,
      "closed_issues": 2,
      "progress_percent": 50.0,
      "successful": false
    }
  ]
}
```

### 3. Milestones List
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
    "issues": [
      {
        "id": 101,
        "title": "Task A",
        "state": "opened",
        "assignee": "Nikos",
        "closed_date": null,
        "milestone_id": 1
      }
    ]
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

---

## 🕒 **GitLab Time-Based Analytics**

### 5. Time-Based Velocity Analysis
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

### 6. Team Capacity Analysis
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

### 7. Issue Type Analysis
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

### 8. Priority Analysis
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

### 9. Burndown Chart Data
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

### 10. Lead Time Analysis
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

### 11. Throughput Analysis
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

### 12. Defect Rate Analysis
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

### 13. Velocity Forecasting
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

### 14. Team Velocity Trends
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

### 15. Sprint Health Indicators
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

### 16. Project Overview Dashboard
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

### 17. Team Dashboard
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

### 18. Sprint Dashboard
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

### 19. Project Health Dashboard
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

### 20. Import from GitLab API
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

## 📋 **Basic Data Endpoints**

### 21. Epics List
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

### 22. Milestones List
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

### 23. Health Check
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

### 24. User Profile
**GET** `/auth/me`

Returns current user profile.

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### 25. Token Verification
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
    "email": "user@example.com"
  }
}
```

### 26. Protected Route Example
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

### 27. Optional Auth Route
**GET** `/auth/optional`

Example of an optionally protected route.

**Response:**
```json
{
  "message": "This route works with or without authentication",
  "authenticated": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

---

## 📋 **Data Models**

### Issue Model
```json
{
  "id": 101,
  "title": "Task A",
  "state": "opened",
  "assignee": "Nikos",
  "reporter": "Nikos",
  "created_date": "2025-07-29T10:00:00",
  "updated_date": "2025-07-29T10:00:00",
  "closed_date": null,
  "time_estimate": 8.0,
  "time_spent": 0.0,
  "labels": ["frontend", "bug"],
  "issue_type": "bug",
  "priority": "high",
  "milestone_id": 1,
  "project_id": 1
}
```

### Milestone Model
```json
{
  "id": 1,
  "title": "Sprint 1",
  "start_date": "2025-07-29",
  "due_date": "2025-08-09",
  "project_id": 1,
  "issues": [...]
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

---

## 📊 **Complete API Summary**

### **Total Endpoints: 32**

**Core Analytics (8 endpoints):**
- Velocity Analysis & Charts
- Epic Success & Status
- Milestone Success & Lists
- Developer Success & Summary
- Period Success Check

**Retrospective Analytics (5 endpoints):**
- Sprint Retrospective Analysis
- Retrospective Trends
- Action Item Effectiveness Tracking
- Project-specific Retrospective Analysis
- Project-specific Retrospective Trends

**GitLab Time-Based Analytics (5 endpoints):**
- Time-based Velocity
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

**Basic Data (3 endpoints):**
- Epics List
- Milestones List
- Health Check

**Authentication (4 endpoints):**
- User Profile
- Token Verification
- Protected Routes
- Optional Auth

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