from repositories.epic_repository import get_epic_by_id
from services.analytics_service import (
    calculate_milestone_progress, 
    is_period_successful, 
    assess_sprint_risks,
    calculate_business_value_metrics,
    estimate_customer_satisfaction,
    calculate_business_impact,
    calculate_sprint_roi,
    estimate_feature_adoption,
    calculate_time_to_market,
    prioritize_backlog_by_value,
    calculate_sprint_capacity,
    predict_sprint_commitment,
    calculate_code_quality_metrics,
    calculate_tech_debt_ratio
)
from flask import request, Blueprint, jsonify
from services.analytics_service import get_velocity_stats
from services.epic_progress_service import get_epic_progress_data
from flask import request, jsonify
from services.analytics_service import is_period_successful
from auth import clerk_auth
from auth import clerk_auth
# GitLab analytics functions are now in analytics_service.py
from services.advanced_analytics_service import (
    get_lead_time_analysis,
    get_throughput_analysis,
    get_defect_rate_analysis,
    get_velocity_forecast,
    get_team_velocity_trends,
    get_sprint_health_indicators
)
from services.dashboard_service import (
    get_project_overview_dashboard,
    get_team_dashboard,
    get_sprint_dashboard,
    get_project_health_dashboard
)
from services.gitlab_integration_service import import_from_gitlab_api
from services.retrospective_service import (
    analyze_sprint_retrospective,
    get_retrospective_trends,
    track_action_item_effectiveness
)

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route("/analytics/milestones")
@clerk_auth.require_auth
def milestone_progress():
    return jsonify(calculate_milestone_progress())

@analytics_bp.route("/analytics/epic-success")
@clerk_auth.require_auth
def epic_success():
    from repositories.epic_repository import get_all_epics
    from services.analytics_service import is_epic_successful
    epics = get_all_epics()
    return jsonify([
        {
            "epic_id": e.id,
            "epic_title": e.title,
            "successful": is_epic_successful(e)
        } for e in epics
    ])

@analytics_bp.route("/analytics/milestone-success")
@clerk_auth.require_auth
def milestone_success():
    from repositories.milestone_repository import get_all_milestones
    from services.analytics_service import is_milestone_successful
    milestones = get_all_milestones()
    return jsonify([
        {
            "milestone_id": m.id,
            "title": m.title,
            "successful": is_milestone_successful(m)
        } for m in milestones
    ])

@analytics_bp.route("/analytics/developer-success")
@clerk_auth.require_auth
def developer_success_view():
    from repositories.milestone_repository import get_all_milestones
    from services.analytics_service import developer_success_per_week
    result = []
    for m in get_all_milestones():
        result.append({
            "milestone_id": m.id,
            "milestone_title": m.title,
            "developers": developer_success_per_week(m)
        })
    return jsonify(result)


@analytics_bp.route("/analytics/developer-summary")
@clerk_auth.require_auth
def developer_summary():
    from services.analytics_service import developer_success_summary
    return jsonify(developer_success_summary())

@analytics_bp.route("/analytics/projects")
@clerk_auth.require_auth
def get_projects():
    from repositories.project_repository import get_all_projects
    
    # Debug headers
    print("=== HEADERS DEBUG ===")
    print(f"All headers: {dict(request.headers)}")
    print(f"Authorization header: {request.headers.get('Authorization', 'NOT FOUND')}")
    print(f"Content-Type: {request.headers.get('Content-Type', 'NOT FOUND')}")
    print(f"User-Agent: {request.headers.get('User-Agent', 'NOT FOUND')}")
    print(f"Accept: {request.headers.get('Accept', 'NOT FOUND')}")
    print("===================")
    
    return jsonify(get_all_projects())

@analytics_bp.route("/analytics/projects/<int:project_id>/milestones")
@clerk_auth.require_auth
def get_project_milestones(project_id):
    from repositories.milestone_repository import get_milestones_by_project
    return jsonify(get_milestones_by_project(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/epics")
@clerk_auth.require_auth
def get_project_epics(project_id):
    from repositories.epic_repository import get_epics_by_project
    return jsonify(get_epics_by_project(project_id))

@analytics_bp.route("/analytics/epic-status")
@clerk_auth.require_auth
def epic_status_route():
    from repositories.epic_repository import get_all_epics
    from services.analytics_service import epic_status
    return jsonify([epic_status(e) for e in get_all_epics()])

@analytics_bp.route("/analytics/velocity")
@clerk_auth.require_auth
def velocity_per_milestone():
    from services.analytics_service import get_velocity_stats
    return jsonify(get_velocity_stats())



@analytics_bp.route("/analytics/velocity/stats")
@clerk_auth.require_auth
def velocity_stats():
    # Πάρε backlog από query param (π.χ. ?backlog=18)
    backlog_param = request.args.get("backlog", default=0, type=int)

    stats = get_velocity_stats(backlog_remaining=backlog_param)
    return jsonify(stats)

@analytics_bp.route("/analytics/velocity/chart")
@clerk_auth.require_auth
def velocity_chart():
    from services.chart_service import generate_velocity_chart_base64
    base64_img = generate_velocity_chart_base64()
    return jsonify({ "image_base64": base64_img })

@analytics_bp.route("/epic/progress/<int:epic_id>", methods=["GET"])
@clerk_auth.require_auth
def epic_progress(epic_id):
    epic = get_epic_by_id(epic_id)
    if not epic:
        return jsonify({"error": "Epic not found"}), 404
    data = get_epic_progress_data(epic)
    return jsonify(data)


@analytics_bp.route("/analytics/is-period-successful", methods=["GET"])
@clerk_auth.require_auth
def check_epic_period_success():
    """
    Επιστρέφει True αν όλα τα issues του συγκεκριμένου epic έκλεισαν επιτυχώς μέσα στην περίοδο.

    Query parameters:
    - epic (str): ID του Epic
    - from_date (YYYY-MM-DD)
    - to_date (YYYY-MM-DD)
    """
    epic_id = request.args.get("epic")
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")

    if not (epic_id and from_date and to_date):
        return jsonify({"error": "Missing required query parameters"}), 400

    # 🔹 Get the full epic object by ID
    from repositories.epic_repository import get_epic_by_id
    epic = get_epic_by_id(int(epic_id))

    if not epic:
        return jsonify({"error": "Epic not found"}), 404

    result = is_period_successful(epic, from_date, to_date)
    return jsonify({"success": result})

# GitLab Time-Based Analytics Endpoints
@analytics_bp.route("/analytics/gitlab/velocity")
@clerk_auth.require_auth
def gitlab_velocity_analysis():
    """Get time-based velocity analysis using GitLab time estimates"""
    from services.analytics_service import get_time_based_velocity_analysis
    return jsonify(get_time_based_velocity_analysis())

@analytics_bp.route("/analytics/team-capacity")
@clerk_auth.require_auth
def team_capacity():
    """Get team capacity analysis with optional project_id parameter"""
    project_id = request.args.get('project_id', type=int)
    from services.analytics_service import get_team_capacity_analysis
    return jsonify(get_team_capacity_analysis(project_id=project_id))



@analytics_bp.route("/analytics/gitlab/issue-types")
@clerk_auth.require_auth
def gitlab_issue_type_analysis():
    """Get analysis by issue type (bug, feature, task)"""
    from services.analytics_service import get_issue_type_analysis
    return jsonify(get_issue_type_analysis())

@analytics_bp.route("/analytics/gitlab/priorities")
@clerk_auth.require_auth
def gitlab_priority_analysis():
    """Get analysis by priority level"""
    from services.analytics_service import get_priority_analysis
    return jsonify(get_priority_analysis())

@analytics_bp.route("/analytics/gitlab/burndown/<int:milestone_id>")
@clerk_auth.require_auth
def gitlab_burndown(milestone_id):
    """Get burndown chart data for a specific milestone"""
    from services.analytics_service import get_burndown_data
    data = get_burndown_data(milestone_id)
    if data is None:
        return jsonify({"error": "Milestone not found"}), 404
    return jsonify(data)

# Advanced Analytics Endpoints
@analytics_bp.route("/analytics/lead-time")
@clerk_auth.require_auth
def lead_time_analysis():
    """Get lead time analysis for all issues"""
    return jsonify(get_lead_time_analysis())

@analytics_bp.route("/analytics/throughput")
@clerk_auth.require_auth
def throughput_analysis():
    """Get throughput analysis"""
    days = request.args.get('days', 30, type=int)
    return jsonify(get_throughput_analysis(days=days))

@analytics_bp.route("/analytics/defect-rate")
@clerk_auth.require_auth
def defect_rate_analysis():
    """Get defect rate analysis"""
    return jsonify(get_defect_rate_analysis())

@analytics_bp.route("/analytics/velocity-forecast")
@clerk_auth.require_auth
def velocity_forecast():
    """Get velocity forecasting"""
    sprints_ahead = request.args.get('sprints_ahead', 3, type=int)
    return jsonify(get_velocity_forecast(sprints_ahead=sprints_ahead))

@analytics_bp.route("/analytics/team-velocity-trends")
@clerk_auth.require_auth
def team_velocity_trends():
    """Get team velocity trends"""
    return jsonify(get_team_velocity_trends())

@analytics_bp.route("/analytics/sprint-health/<int:milestone_id>")
@clerk_auth.require_auth
def sprint_health(milestone_id):
    """Get sprint health indicators"""
    data = get_sprint_health_indicators(milestone_id)
    if data is None:
        return jsonify({"error": "Milestone not found"}), 404
    return jsonify(data)

# Dashboard Endpoints
@analytics_bp.route("/dashboard/overview")
@clerk_auth.require_auth
def overview_dashboard():
    """Get project overview dashboard"""
    return jsonify(get_project_overview_dashboard())

@analytics_bp.route("/dashboard/team")
@clerk_auth.require_auth
def team_dashboard():
    """Get team dashboard"""
    return jsonify(get_team_dashboard())

@analytics_bp.route("/dashboard/sprint")
@clerk_auth.require_auth
def sprint_dashboard():
    """Get sprint dashboard"""
    return jsonify(get_sprint_dashboard())

@analytics_bp.route("/dashboard/health")
@clerk_auth.require_auth
def health_dashboard():
    """Get project health dashboard"""
    return jsonify(get_project_health_dashboard())

# GitLab Integration Endpoints
@analytics_bp.route("/import/gitlab", methods=["POST"])
@clerk_auth.require_auth
def import_gitlab_data():
    """Import data from GitLab API"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    project_ids = data.get("project_ids", [])
    gitlab_url = data.get("gitlab_url")
    access_token = data.get("access_token")
    
    if not project_ids:
        return jsonify({"error": "No project IDs provided"}), 400
    
    if not access_token:
        return jsonify({"error": "GitLab access token required"}), 400
    
    try:
        results = import_from_gitlab_api(project_ids, gitlab_url, access_token)
        return jsonify({
            "message": "Import completed",
            "results": results
        })
    except Exception as e:
        return jsonify({"error": f"Import failed: {str(e)}"}), 500

# Add project-aware routes after the existing routes

# Project-specific Analytics Routes
@analytics_bp.route("/analytics/projects/<int:project_id>/milestone-progress")
@clerk_auth.require_auth
def project_specific_milestone_progress(project_id):
    from services.analytics_service import calculate_milestone_progress
    return jsonify(calculate_milestone_progress(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/epic-success")
@clerk_auth.require_auth
def project_specific_epic_success(project_id):
    from services.analytics_service import get_epics_by_project_success
    return jsonify(get_epics_by_project_success(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/milestone-success")
@clerk_auth.require_auth
def project_specific_milestone_success(project_id):
    from services.analytics_service import get_milestones_by_project_status
    return jsonify(get_milestones_by_project_status(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/developer-success")
@clerk_auth.require_auth
def project_specific_developer_success_view(project_id):
    from repositories.milestone_repository import get_milestones_by_project, get_milestone_by_id
    from services.analytics_service import developer_success_per_week
    result = []
    milestones_data = get_milestones_by_project(project_id)
    for m_data in milestones_data:
        m = get_milestone_by_id(m_data['id'])
        result.append({
            "milestone_id": m.id,
            "milestone_title": m.title,
            "developers": developer_success_per_week(m)
        })
    return jsonify(result)

@analytics_bp.route("/analytics/projects/<int:project_id>/developer-summary")
@clerk_auth.require_auth
def project_specific_developer_summary(project_id):
    from services.analytics_service import developer_success_summary
    return jsonify(developer_success_summary(project_id=project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/epic-status")
@clerk_auth.require_auth
def project_specific_epic_status_route(project_id):
    from services.analytics_service import get_epics_by_project_status
    return jsonify(get_epics_by_project_status(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/epic-progress/<int:epic_id>")
@clerk_auth.require_auth
def project_specific_epic_progress(project_id, epic_id):
    """Get epic progress data for a specific epic within a project"""
    from repositories.epic_repository import get_epic_by_id
    from services.epic_progress_service import get_epic_progress_data
    
    # Get the epic and verify it belongs to the project
    epic = get_epic_by_id(epic_id)
    if not epic:
        return jsonify({"error": "Epic not found"}), 404
    
    if epic.project_id != project_id:
        return jsonify({"error": "Epic does not belong to the specified project"}), 400
    
    data = get_epic_progress_data(epic)
    return jsonify(data)

@analytics_bp.route("/analytics/projects/<int:project_id>/velocity")
@clerk_auth.require_auth
def project_specific_velocity_per_milestone(project_id):
    from services.analytics_service import get_velocity_stats
    return jsonify(get_velocity_stats(project_id=project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/velocity/stats")
@clerk_auth.require_auth
def project_specific_velocity_stats(project_id):
    # Πάρε backlog από query param (π.χ. ?backlog=18)
    backlog_param = request.args.get("backlog", default=0, type=int)
    
    from services.analytics_service import get_velocity_stats
    stats = get_velocity_stats(backlog_remaining=backlog_param, project_id=project_id)
    return jsonify(stats)

@analytics_bp.route("/analytics/projects/<int:project_id>/velocity/chart")
@clerk_auth.require_auth
def project_specific_velocity_chart(project_id):
    from services.chart_service import generate_velocity_chart_base64
    from services.analytics_service import get_velocity_stats
    stats = get_velocity_stats(project_id=project_id)
    chart_base64 = generate_velocity_chart_base64(stats)
    return jsonify({"chart": chart_base64})

@analytics_bp.route("/analytics/projects/<int:project_id>/gitlab/velocity")
@clerk_auth.require_auth
def project_specific_gitlab_velocity_analysis(project_id):
    """Get time-based velocity analysis using GitLab time estimates for specific project"""
    from services.analytics_service import get_time_based_velocity_analysis
    return jsonify(get_time_based_velocity_analysis(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/gitlab/team-capacity")
@clerk_auth.require_auth
def project_specific_gitlab_team_capacity(project_id):
    """Get team capacity analysis based on time estimates for specific project"""
    from services.analytics_service import get_team_capacity_analysis
    return jsonify(get_team_capacity_analysis(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/gitlab/issue-types")
@clerk_auth.require_auth
def project_specific_gitlab_issue_type_analysis(project_id):
    """Get analysis by issue type (bug, feature, task) for specific project"""
    from services.analytics_service import get_issue_type_analysis
    return jsonify(get_issue_type_analysis(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/gitlab/priorities")
@clerk_auth.require_auth
def project_specific_gitlab_priority_analysis(project_id):
    """Get analysis by priority level for specific project"""
    from services.analytics_service import get_priority_analysis
    return jsonify(get_priority_analysis(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/gitlab/burndown/<int:milestone_id>")
@clerk_auth.require_auth
def project_specific_gitlab_burndown(project_id, milestone_id):
    """Get burndown chart data for a specific milestone in project"""
    from services.analytics_service import get_burndown_data
    from repositories.milestone_repository import get_milestone_by_id
    
    # Verify milestone belongs to project
    milestone = get_milestone_by_id(milestone_id)
    if not milestone or milestone.project_id != project_id:
        return jsonify({"error": "Milestone not found in project"}), 404
    
    return jsonify(get_burndown_data(milestone_id))

# Project-specific Advanced Analytics Routes
@analytics_bp.route("/analytics/projects/<int:project_id>/lead-time")
@clerk_auth.require_auth
def project_specific_lead_time_analysis(project_id):
    """Get lead time analysis for all issues in project"""
    from services.advanced_analytics_service import get_lead_time_analysis
    return jsonify(get_lead_time_analysis(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/throughput")
@clerk_auth.require_auth
def project_specific_throughput_analysis(project_id):
    """Get throughput analysis for project"""
    from services.advanced_analytics_service import get_throughput_analysis
    days = request.args.get('days', 30, type=int)
    return jsonify(get_throughput_analysis(days=days, project_id=project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/defect-rate")
@clerk_auth.require_auth
def project_specific_defect_rate_analysis(project_id):
    """Get defect rate analysis for project"""
    from services.advanced_analytics_service import get_defect_rate_analysis
    return jsonify(get_defect_rate_analysis(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/velocity-forecast")
@clerk_auth.require_auth
def project_specific_velocity_forecast(project_id):
    """Get velocity forecasting for project"""
    from services.advanced_analytics_service import get_velocity_forecast
    sprints_ahead = request.args.get('sprints_ahead', 3, type=int)
    return jsonify(get_velocity_forecast(sprints_ahead=sprints_ahead, project_id=project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/team-velocity-trends")
@clerk_auth.require_auth
def project_specific_team_velocity_trends(project_id):
    """Get team velocity trends for project"""
    from services.advanced_analytics_service import get_team_velocity_trends
    return jsonify(get_team_velocity_trends(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/sprint-health/<int:milestone_id>")
@clerk_auth.require_auth
def project_specific_sprint_health(project_id, milestone_id):
    """Get sprint health indicators for specific milestone in project"""
    from services.advanced_analytics_service import get_sprint_health_indicators
    from repositories.milestone_repository import get_milestone_by_id
    
    # Verify milestone belongs to project
    milestone = get_milestone_by_id(milestone_id)
    if not milestone or milestone.project_id != project_id:
        return jsonify({"error": "Milestone not found in project"}), 404
    
    return jsonify(get_sprint_health_indicators(milestone_id))

# Project-specific Dashboard Routes
@analytics_bp.route("/analytics/projects/<int:project_id>/dashboard/overview")
@clerk_auth.require_auth
def project_specific_overview_dashboard(project_id):
    """Get project overview dashboard data"""
    from services.dashboard_service import get_project_overview_dashboard
    return jsonify(get_project_overview_dashboard(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/dashboard/team")
@clerk_auth.require_auth
def project_specific_team_dashboard(project_id):
    """Get team dashboard data for project"""
    from services.dashboard_service import get_team_dashboard
    return jsonify(get_team_dashboard(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/dashboard/sprint")
@clerk_auth.require_auth
def project_specific_sprint_dashboard(project_id):
    """Get sprint dashboard data for project"""
    from services.dashboard_service import get_sprint_dashboard
    return jsonify(get_sprint_dashboard(project_id))

@analytics_bp.route("/analytics/projects/<int:project_id>/dashboard/health")
@clerk_auth.require_auth
def project_specific_health_dashboard(project_id):
    """Get project health dashboard data"""
    from services.dashboard_service import get_project_health_dashboard
    return jsonify(get_project_health_dashboard(project_id))

# ============================================================================
# PROJECT-SPECIFIC RETROSPECTIVE ROUTES
# ============================================================================

@analytics_bp.route("/analytics/projects/<int:project_id>/retrospective/<int:sprint_id>")
@clerk_auth.require_auth
def project_specific_sprint_retrospective(project_id, sprint_id):
    """Analyze sprint for retrospective insights (project-specific)"""
    insights = analyze_sprint_retrospective(sprint_id, project_id)
    return jsonify(insights)

@analytics_bp.route("/analytics/projects/<int:project_id>/retrospective/actions/<int:sprint_id>")
@clerk_auth.require_auth
def project_specific_retrospective_actions(project_id, sprint_id):
    """Track effectiveness of retrospective actions (project-specific)"""
    from flask import request
    import json
    
    action_items = request.json.get('action_items', [])
    follow_up_sprints = request.json.get('follow_up_sprints', [])
    
    effectiveness = track_action_item_effectiveness(sprint_id, action_items, follow_up_sprints)
    return jsonify(effectiveness)

@analytics_bp.route("/analytics/projects/<int:project_id>/retrospective/trends")
@clerk_auth.require_auth
def project_specific_retrospective_trends(project_id):
    """Get retrospective trends across multiple sprints (project-specific)"""
    sprints_count = request.args.get('sprints_count', 5, type=int)
    
    trends = get_retrospective_trends(project_id, sprints_count)
    return jsonify(trends)

# GitLab Project Data Route
@analytics_bp.route("/analytics/projects/<int:project_id>/gitlab/full-data")
@clerk_auth.require_auth
def get_gitlab_full_project_data(project_id):
    """
    Get all GitLab data for a project (issues + milestones) organized for frontend
    This allows you to create your own epics and milestones structure
    """
    from services.gitlab_integration_service import GitLabIntegration
    from repositories.project_repository import get_project_by_id
    
    # Get project info
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    # Get GitLab configuration from project or environment
    gitlab_url = project.gitlab_url if hasattr(project, 'gitlab_url') else None
    gitlab_token = project.gitlab_token if hasattr(project, 'gitlab_token') else None
    
    if not gitlab_url or not gitlab_token:
        return jsonify({"error": "GitLab configuration not found for this project"}), 400
    
    try:
        # Initialize GitLab integration
        gitlab = GitLabIntegration(gitlab_url, gitlab_token)
        
        # Get all issues for the project
        issues = gitlab.get_project_issues(project_id)
        
        # Get all milestones for the project
        milestones = gitlab.get_project_milestones(project_id)
        
        # Organize data for frontend consumption
        organized_data = {
            "project_info": {
                "id": project_id,
                "name": project.name,
                "gitlab_url": gitlab_url,
                "total_issues": len(issues),
                "total_milestones": len(milestones)
            },
            "raw_issues": issues,
            "raw_milestones": milestones,
            "organized_by_labels": {},
            "organized_by_assignee": {},
            "organized_by_state": {
                "open": [],
                "closed": []
            },
            "organized_by_priority": {
                "high": [],
                "medium": [],
                "low": []
            },
            "organized_by_type": {
                "bug": [],
                "feature": [],
                "task": []
            },
            "statistics": {
                "total_issues": len(issues),
                "open_issues": len([i for i in issues if i.get("state") == "opened"]),
                "closed_issues": len([i for i in issues if i.get("state") == "closed"]),
                "total_milestones": len(milestones),
                "active_milestones": len([m for m in milestones if m.get("state") == "active"]),
                "closed_milestones": len([m for m in milestones if m.get("state") == "closed"])
            }
        }
        
        # Organize issues by labels (potential epics)
        for issue in issues:
            labels = issue.get("labels", [])
            
            # Organize by labels (potential epics)
            for label in labels:
                if label not in organized_data["organized_by_labels"]:
                    organized_data["organized_by_labels"][label] = []
                organized_data["organized_by_labels"][label].append(issue)
            
            # Organize by assignee
            assignee = issue.get("assignee", {}).get("name") if issue.get("assignee") else "Unassigned"
            if assignee not in organized_data["organized_by_assignee"]:
                organized_data["organized_by_assignee"][assignee] = []
            organized_data["organized_by_assignee"][assignee].append(issue)
            
            # Organize by state
            state = issue.get("state", "opened")
            if state == "opened":
                organized_data["organized_by_state"]["open"].append(issue)
            else:
                organized_data["organized_by_state"]["closed"].append(issue)
            
            # Organize by priority (from labels)
            priority = "medium"  # default
            if "high" in labels:
                priority = "high"
            elif "low" in labels:
                priority = "low"
            organized_data["organized_by_priority"][priority].append(issue)
            
            # Organize by type (from labels)
            issue_type = "task"  # default
            if "bug" in labels:
                issue_type = "bug"
            elif "feature" in labels:
                issue_type = "feature"
            organized_data["organized_by_type"][issue_type].append(issue)
        
        return jsonify(organized_data)
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch GitLab data: {str(e)}"}), 500

# Save GitLab Data to Database Route
@analytics_bp.route("/analytics/projects/<int:project_id>/gitlab/save-to-database", methods=["POST"])
@clerk_auth.require_auth
def save_gitlab_data_to_database(project_id):
    """
    Save GitLab data (issues and milestones) to local database
    This allows you to work with the data offline and create your own structure
    """
    from services.gitlab_integration_service import GitLabIntegration
    from repositories.project_repository import get_project_by_id
    from models.models import Issue, Milestone, Epic
    from db_init import db
    from datetime import datetime
    
    # Get project info
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    # Get GitLab configuration
    gitlab_url = project.gitlab_url if hasattr(project, 'gitlab_url') else None
    gitlab_token = project.gitlab_token if hasattr(project, 'gitlab_token') else None
    
    if not gitlab_url or not gitlab_token:
        return jsonify({"error": "GitLab configuration not found for this project"}), 400
    
    try:
        # Initialize GitLab integration
        gitlab = GitLabIntegration(gitlab_url, gitlab_token)
        
        # Get all issues and milestones
        issues = gitlab.get_project_issues(project_id)
        milestones = gitlab.get_project_milestones(project_id)
        
        # Create epics from labels (group issues by common labels)
        label_to_epic = {}
        epic_counter = 1
        
        for issue in issues:
            labels = issue.get("labels", [])
            for label in labels:
                if label not in label_to_epic:
                    # Create new epic for this label
                    epic = Epic(
                        title=f"Epic: {label}",
                        description=f"Auto-generated epic from GitLab label: {label}",
                        project_id=project_id,
                        created_date=datetime.now(),
                        updated_date=datetime.now()
                    )
                    db.session.add(epic)
                    db.session.flush()  # Get the epic ID
                    label_to_epic[label] = epic.id
                    epic_counter += 1
        
        # Save milestones
        saved_milestones = {}
        for gitlab_milestone in milestones:
            milestone = Milestone(
                title=gitlab_milestone.get("title", "Untitled"),
                description=gitlab_milestone.get("description", ""),
                project_id=project_id,
                start_date=datetime.fromisoformat(gitlab_milestone["start_date"].replace("Z", "+00:00")) if gitlab_milestone.get("start_date") else datetime.now(),
                due_date=datetime.fromisoformat(gitlab_milestone["due_date"].replace("Z", "+00:00")) if gitlab_milestone.get("due_date") else datetime.now(),
                state=gitlab_milestone.get("state", "active"),
                created_date=datetime.fromisoformat(gitlab_milestone["created_at"].replace("Z", "+00:00")) if gitlab_milestone.get("created_at") else datetime.now(),
                updated_date=datetime.fromisoformat(gitlab_milestone["updated_at"].replace("Z", "+00:00")) if gitlab_milestone.get("updated_at") else datetime.now()
            )
            db.session.add(milestone)
            db.session.flush()  # Get the milestone ID
            saved_milestones[gitlab_milestone["id"]] = milestone.id
        
        # Save issues
        saved_issues = 0
        for gitlab_issue in issues:
            # Determine epic from labels
            epic_id = None
            labels = gitlab_issue.get("labels", [])
            for label in labels:
                if label in label_to_epic:
                    epic_id = label_to_epic[label]
                    break
            
            # Determine milestone from GitLab milestone
            milestone_id = None
            if gitlab_issue.get("milestone") and gitlab_issue["milestone"]["id"] in saved_milestones:
                milestone_id = saved_milestones[gitlab_issue["milestone"]["id"]]
            
            # Parse time tracking
            time_stats = gitlab_issue.get("time_stats", {})
            time_estimate = time_stats.get("time_estimate", 0) / 3600  # Convert seconds to hours
            time_spent = time_stats.get("total_time_spent", 0) / 3600  # Convert seconds to hours
            
            # Determine issue type and priority from labels
            issue_type = "task"  # default
            priority = "medium"  # default
            if "bug" in labels:
                issue_type = "bug"
            elif "feature" in labels:
                issue_type = "feature"
            
            if "high" in labels:
                priority = "high"
            elif "low" in labels:
                priority = "low"
            
            issue = Issue(
                title=gitlab_issue.get("title", "Untitled"),
                description=gitlab_issue.get("description", ""),
                state=gitlab_issue.get("state", "opened"),
                assignee=gitlab_issue.get("assignee", {}).get("name") if gitlab_issue.get("assignee") else None,
                reporter=gitlab_issue.get("author", {}).get("name") if gitlab_issue.get("author") else None,
                project_id=project_id,
                epic_id=epic_id,
                milestone_id=milestone_id,
                created_date=datetime.fromisoformat(gitlab_issue["created_at"].replace("Z", "+00:00")) if gitlab_issue.get("created_at") else datetime.now(),
                updated_date=datetime.fromisoformat(gitlab_issue["updated_at"].replace("Z", "+00:00")) if gitlab_issue.get("updated_at") else datetime.now(),
                closed_date=datetime.fromisoformat(gitlab_issue["closed_at"].replace("Z", "+00:00")) if gitlab_issue.get("closed_at") else None,
                time_estimate=time_estimate,
                time_spent=time_spent,
                issue_type=issue_type,
                priority=priority,
                gitlab_id=gitlab_issue.get("id")  # Store original GitLab ID for reference
            )
            db.session.add(issue)
            saved_issues += 1
        
        # Commit all changes
        db.session.commit()
        
        return jsonify({
            "message": "GitLab data saved successfully",
            "summary": {
                "project_id": project_id,
                "epics_created": len(label_to_epic),
                "milestones_saved": len(saved_milestones),
                "issues_saved": saved_issues,
                "total_epics": len(label_to_epic),
                "total_milestones": len(saved_milestones),
                "total_issues": saved_issues
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to save GitLab data: {str(e)}"}), 500

# Create Custom Epic Route
@analytics_bp.route("/analytics/projects/<int:project_id>/epics", methods=["POST"])
@clerk_auth.require_auth
def create_custom_epic(project_id):
    """
    Create a custom epic and assign issues to it
    """
    from models.models import Epic, Issue
    from db_init import db
    from datetime import datetime
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    title = data.get("title")
    description = data.get("description", "")
    start_date = data.get("start_date")
    due_date = data.get("due_date")
    issue_ids = data.get("issue_ids", [])
    
    if not title or not start_date or not due_date:
        return jsonify({"error": "Title, start_date, and due_date are required"}), 400
    
    try:
        # Create the epic
        epic = Epic(
            title=title,
            description=description,
            start_date=datetime.fromisoformat(start_date).date(),
            due_date=datetime.fromisoformat(due_date).date(),
            project_id=project_id,
            created_date=datetime.now(),
            updated_date=datetime.now()
        )
        db.session.add(epic)
        db.session.flush()  # Get the epic ID
        
        # Assign issues to the epic
        if issue_ids:
            issues = Issue.query.filter(Issue.id.in_(issue_ids), Issue.project_id == project_id).all()
            for issue in issues:
                issue.epic_id = epic.id
            db.session.add_all(issues)
        
        db.session.commit()
        
        return jsonify({
            "message": "Epic created successfully",
            "epic": {
                "id": epic.id,
                "title": epic.title,
                "description": epic.description,
                "start_date": epic.start_date.isoformat(),
                "due_date": epic.due_date.isoformat(),
                "issues_count": len(issue_ids)
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create epic: {str(e)}"}), 500

# Create Custom Milestone Route
@analytics_bp.route("/analytics/projects/<int:project_id>/milestones", methods=["POST"])
@clerk_auth.require_auth
def create_custom_milestone(project_id):
    """
    Create a custom milestone and assign issues to it
    """
    from models.models import Milestone, Issue
    from db_init import db
    from datetime import datetime
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    title = data.get("title")
    description = data.get("description", "")
    start_date = data.get("start_date")
    due_date = data.get("due_date")
    issue_ids = data.get("issue_ids", [])
    
    if not title or not start_date or not due_date:
        return jsonify({"error": "Title, start_date, and due_date are required"}), 400
    
    try:
        # Create the milestone
        milestone = Milestone(
            title=title,
            description=description,
            start_date=datetime.fromisoformat(start_date).date(),
            due_date=datetime.fromisoformat(due_date).date(),
            project_id=project_id,
            state="active",
            created_date=datetime.now(),
            updated_date=datetime.now()
        )
        db.session.add(milestone)
        db.session.flush()  # Get the milestone ID
        
        # Assign issues to the milestone
        if issue_ids:
            issues = Issue.query.filter(Issue.id.in_(issue_ids), Issue.project_id == project_id).all()
            for issue in issues:
                issue.milestone_id = milestone.id
            db.session.add_all(issues)
        
        db.session.commit()
        
        return jsonify({
            "message": "Milestone created successfully",
            "milestone": {
                "id": milestone.id,
                "title": milestone.title,
                "description": milestone.description,
                "start_date": milestone.start_date.isoformat(),
                "due_date": milestone.due_date.isoformat(),
                "state": milestone.state,
                "issues_count": len(issue_ids)
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create milestone: {str(e)}"}), 500

# Get Available Issues for Epic/Milestone Creation
@analytics_bp.route("/analytics/projects/<int:project_id>/available-issues")
@clerk_auth.require_auth
def get_available_issues(project_id):
    """
    Get all issues that are not assigned to any epic or milestone
    """
    from models.models import Issue
    
    try:
        # Get issues without epic or milestone
        available_issues = Issue.query.filter(
            Issue.project_id == project_id,
            (Issue.epic_id.is_(None) | Issue.milestone_id.is_(None))
        ).all()
        
        return jsonify({
            "available_issues": [
                {
                    "id": issue.id,
                    "title": issue.title,
                    "state": issue.state,
                    "assignee": issue.assignee,
                    "issue_type": issue.issue_type,
                    "priority": issue.priority,
                    "time_estimate": issue.time_estimate,
                    "time_spent": issue.time_spent
                } for issue in available_issues
            ],
            "count": len(available_issues)
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to get available issues: {str(e)}"}), 500

# ============================================================================
# SPRINT PLANNING ROUTES
# ============================================================================

@analytics_bp.route("/analytics/sprint-planning/capacity")
@clerk_auth.require_auth
def sprint_capacity():
    """Calculate team capacity for sprint planning"""
    from flask import request
    import re
    
    # Support array notation for all parameters
    args_dict = dict(request.args)
    
    # Extract team_members array
    team_members = []
    array_members = []
    for key in args_dict:
        if key.startswith('team_members[') and key.endswith(']'):
            try:
                index = int(key[13:-1])  # Extract index from team_members[index]
                array_members.append((index, args_dict[key]))
            except ValueError:
                continue
    
    if array_members:
        # Sort by index and extract values
        array_members.sort(key=lambda x: x[0])
        team_members = [member[1] for member in array_members]
    else:
        # Fallback to multiple parameters
        team_members = request.args.getlist('team_members')
    
    # Extract sprint_duration array (take first value)
    sprint_duration = 2  # default
    sprint_duration_array = []
    for key in args_dict:
        if key.startswith('sprint_duration[') and key.endswith(']'):
            try:
                index = int(key[16:-1])  # Extract index from sprint_duration[index]
                sprint_duration_array.append((index, args_dict[key]))
            except ValueError:
                continue
    
    if sprint_duration_array:
        # Sort by index and take first value
        sprint_duration_array.sort(key=lambda x: x[0])
        sprint_duration = int(sprint_duration_array[0][1])
    else:
        # Fallback to single parameter
        sprint_duration = int(request.args.get('sprint_duration', 2))
    
    # Extract project_id array (take first value)
    project_id = None
    project_id_array = []
    for key in args_dict:
        if key.startswith('project_id[') and key.endswith(']'):
            try:
                index = int(key[12:-1])  # Extract index from project_id[index]
                project_id_array.append((index, args_dict[key]))
            except ValueError:
                continue
    
    if project_id_array:
        # Sort by index and take first value
        project_id_array.sort(key=lambda x: x[0])
        project_id = int(project_id_array[0][1])
    else:
        # Fallback to single parameter
        project_id = request.args.get('project_id', type=int)
    
    if not team_members:
        return jsonify({"error": "Team members required"}), 400
    
    capacity = calculate_sprint_capacity(team_members, sprint_duration, project_id)
    return jsonify(capacity)

@analytics_bp.route("/analytics/sprint-planning/commitment")
@clerk_auth.require_auth
def sprint_commitment():
    """Predict sprint commitment"""
    from flask import request
    import re
    
    # Support array notation for all parameters (same as capacity route)
    args_dict = dict(request.args)
    
    # Extract team_members array
    team_members = []
    array_members = []
    for key in args_dict:
        if key.startswith('team_members[') and key.endswith(']'):
            try:
                index = int(key[13:-1])  # Extract index from team_members[index]
                array_members.append((index, args_dict[key]))
            except ValueError:
                continue
    
    if array_members:
        # Sort by index and extract values
        array_members.sort(key=lambda x: x[0])
        team_members = [member[1] for member in array_members]
    else:
        # Fallback to multiple parameters
        team_members = request.args.getlist('team_members')
    
    # Extract sprint_duration (take first value)
    sprint_duration = 2  # default
    sprint_duration_array = []
    for key in args_dict:
        if key.startswith('sprint_duration[') and key.endswith(']'):
            try:
                index = int(key[16:-1])  # Extract index from sprint_duration[index]
                sprint_duration_array.append((index, args_dict[key]))
            except ValueError:
                continue
    
    if sprint_duration_array:
        # Sort by index and take first value
        sprint_duration_array.sort(key=lambda x: x[0])
        sprint_duration = int(sprint_duration_array[0][1])
    else:
        # Fallback to single parameter
        sprint_duration = int(request.args.get('sprint_duration', 2))
    
    # Extract project_id
    project_id = request.args.get('project_id', type=int)
    
    if not team_members:
        return jsonify({"error": "Team members required"}), 400
    
    # Use the existing calculate_sprint_capacity function to get proper structure
    team_capacity = calculate_sprint_capacity(team_members, sprint_duration, project_id)
    
    # Get backlog_items from database or use empty list
    backlog_items = []  # You can populate this from your database if needed
    
    prediction = predict_sprint_commitment(team_capacity, backlog_items, project_id)
    return jsonify(prediction)

# ============================================================================
# QUALITY ANALYTICS ROUTES
# ============================================================================

@analytics_bp.route("/analytics/quality/metrics")
@clerk_auth.require_auth
def quality_metrics():
    """Get comprehensive code quality metrics"""
    project_id = request.args.get('project_id', type=int)
    metrics = calculate_code_quality_metrics(project_id)
    return jsonify(metrics)

@analytics_bp.route("/analytics/quality/tech-debt-impact")
@clerk_auth.require_auth
def tech_debt_impact():
    """Analyze technical debt impact"""
    project_id = request.args.get('project_id', type=int)
    
    # Calculate tech debt impact
    tech_debt_ratio = calculate_tech_debt_ratio(project_id)
    velocity_with_debt = get_velocity_stats(project_id=project_id)
    
    # Estimate velocity without debt (simplified)
    estimated_velocity_improvement = tech_debt_ratio * 0.1  # 10% improvement per 1% debt
    
    return jsonify({
        'tech_debt_ratio': tech_debt_ratio,
        'estimated_velocity_improvement': round(estimated_velocity_improvement, 2),
        'recommendation': 'Reduce technical debt' if tech_debt_ratio > 20 else 'Maintain current levels'
    })

# ============================================================================
# RISK ASSESSMENT ROUTES
# ============================================================================

@analytics_bp.route("/analytics/risks/sprint/<int:sprint_id>")
@clerk_auth.require_auth
def sprint_risks(sprint_id):
    """Assess risks for a specific sprint"""
    project_id = request.args.get('project_id', type=int)
    risks = assess_sprint_risks(sprint_id, project_id)
    
    if 'error' in risks:
        return jsonify(risks), 404
    
    return jsonify(risks)

@analytics_bp.route("/analytics/risks/project/<int:project_id>")
@clerk_auth.require_auth
def project_risks(project_id):
    """Assess overall project risks"""
    from repositories.milestone_repository import get_milestones_by_project, get_milestone_by_id
    
    milestones_data = get_milestones_by_project(project_id)
    project_risks = []
    
    for milestone_data in milestones_data:
        # Get the actual milestone object for risk assessment
        milestone = get_milestone_by_id(milestone_data['id'])
        if milestone:
            risks = assess_sprint_risks(milestone_data['id'], project_id)
            if 'error' not in risks:
                project_risks.append(risks)
    
    if project_risks:
        avg_risk_score = sum(r['overall_risk_score'] for r in project_risks) / len(project_risks)
        return jsonify({
            'project_id': project_id,
            'average_risk_score': round(avg_risk_score, 2),
            'sprint_risks': project_risks,
            'overall_risk_level': 'high' if avg_risk_score > 70 else 'medium' if avg_risk_score > 40 else 'low'
        })
    else:
        return jsonify({"error": "No sprints found for project"}), 404

# ============================================================================
# RETROSPECTIVE ANALYTICS ROUTES
# ============================================================================

@analytics_bp.route("/analytics/retrospective/<int:sprint_id>")
@clerk_auth.require_auth
def sprint_retrospective(sprint_id):
    """Analyze sprint for retrospective insights"""
    project_id = request.args.get('project_id', type=int)
    insights = analyze_sprint_retrospective(sprint_id, project_id)
    
    if 'error' in insights:
        return jsonify(insights), 404
    
    return jsonify(insights)

@analytics_bp.route("/analytics/retrospective/actions/<int:sprint_id>")
@clerk_auth.require_auth
def retrospective_actions(sprint_id):
    """Track effectiveness of retrospective actions"""
    from flask import request
    import json
    
    action_items = request.json.get('action_items', [])
    follow_up_sprints = request.json.get('follow_up_sprints', [])
    
    effectiveness = track_action_item_effectiveness(sprint_id, action_items, follow_up_sprints)
    return jsonify(effectiveness)

@analytics_bp.route("/analytics/retrospective/trends")
@clerk_auth.require_auth
def retrospective_trends():
    """Get retrospective trends across multiple sprints"""
    project_id = request.args.get('project_id', type=int)
    sprints_count = request.args.get('sprints_count', 5, type=int)
    
    trends = get_retrospective_trends(project_id, sprints_count)
    return jsonify(trends)

# ============================================================================
# BUSINESS VALUE ROUTES
# ============================================================================

@analytics_bp.route("/analytics/business-value/metrics")
@clerk_auth.require_auth
def business_value_metrics():
    """Get business value metrics"""
    project_id = request.args.get('project_id', type=int)
    metrics = calculate_business_value_metrics(project_id)
    
    if not metrics:
        return jsonify({"error": "No business value metrics found"}), 404
    
    return jsonify(metrics)

@analytics_bp.route("/analytics/business-value/backlog-prioritization")
@clerk_auth.require_auth
def backlog_prioritization():
    """Prioritize backlog by business value"""
    from flask import request
    import json
    
    backlog_items = request.json.get('backlog_items', [])
    project_id = request.args.get('project_id', type=int)
    
    if not backlog_items:
        return jsonify({"error": "No backlog items provided"}), 400
    
    prioritized_backlog = prioritize_backlog_by_value(backlog_items, project_id)
    return jsonify({
        'prioritized_backlog': prioritized_backlog,
        'total_items': len(prioritized_backlog)
    })

@analytics_bp.route("/analytics/business-value/roi-trends")
@clerk_auth.require_auth
def roi_trends():
    """Calculate ROI trends over time"""
    project_id = request.args.get('project_id', type=int)
    
    # Get ROI for last 6 sprints
    from repositories.milestone_repository import get_milestones_by_project, get_all_milestones
    
    if project_id:
        milestones_data = get_milestones_by_project(project_id)
    else:
        milestones_data = [{'id': m.id} for m in get_all_milestones()]
    
    roi_trends = []
    for milestone_data in milestones_data[:6]:  # Last 6 sprints
        roi = calculate_sprint_roi(project_id)
        roi_trends.append({
            'sprint_id': milestone_data['id'],
            'roi': roi
        })
    
    return jsonify({
        'roi_trends': roi_trends,
        'average_roi': round(sum(r['roi'] for r in roi_trends) / len(roi_trends), 2) if roi_trends else 0
    })

# ============================================================================
# TEAM COLLABORATION ROUTES
# ============================================================================

@analytics_bp.route("/analytics/collaboration/team-analysis")
@clerk_auth.require_auth
def team_collaboration_analysis():
    """Analyze team collaboration patterns"""
    project_id = request.args.get('project_id', type=int)
    
    # Simplified collaboration analysis
    from repositories.milestone_repository import get_milestones_by_project, get_milestone_by_id, get_all_milestones
    
    if project_id:
        milestones_data = get_milestones_by_project(project_id)
        milestones = [get_milestone_by_id(m['id']) for m in milestones_data if get_milestone_by_id(m['id'])]
    else:
        milestones = get_all_milestones()
    
    collaboration_metrics = {
        'pair_programming_sessions': estimate_pair_programming(milestones),
        'code_review_participation': analyze_review_participation(milestones),
        'knowledge_sharing_metrics': estimate_knowledge_sharing(milestones),
        'cross_team_collaboration': analyze_cross_team_work(milestones),
        'mentorship_effectiveness': estimate_mentorship_impact(milestones)
    }
    
    return jsonify(collaboration_metrics)

def estimate_pair_programming(milestones):
    """Estimate pair programming sessions"""
    # Simplified estimation based on issue patterns
    total_issues = sum(len(m.issues) for m in milestones)
    complex_issues = sum(1 for m in milestones for i in m.issues if i.time_estimate and i.time_estimate > 8)
    
    return {
        'estimated_sessions': complex_issues,
        'participation_rate': round((complex_issues / total_issues * 100), 2) if total_issues > 0 else 0
    }

def analyze_review_participation(milestones):
    """Analyze code review participation"""
    # Simplified analysis
    total_issues = sum(len(m.issues) for m in milestones)
    reviewed_issues = sum(1 for m in milestones for i in m.issues if i.state == "closed")
    
    return {
        'reviewed_issues': reviewed_issues,
        'review_rate': round((reviewed_issues / total_issues * 100), 2) if total_issues > 0 else 0
    }

def estimate_knowledge_sharing(milestones):
    """Estimate knowledge sharing metrics
    
    This function estimates the knowledge sharing metrics based on the issues in the milestones.
    It counts the issues that have a title longer than 30 characters and calculates the documentation rate.
    
    Args:
        milestones: List of milestones
        Returns:
        Dictionary containing the following metrics:
            documented_issues: Number of issues with titles longer than 30 characters
            documentation_rate: Percentage of issues with titles longer than 30 characters
            
    Example:
        >>> milestones = [
        ...     Milestone(issues=[
        ...         Issue(title="This is a short title"),
        ...         Issue(title="This is a longer title that should be documented")
        ...     ])
        ... ]
        >>> estimate_knowledge_sharing(milestones)
    """
    # Simplified estimation
    total_issues = sum(len(m.issues) for m in milestones)
    documented_issues = sum(1 for m in milestones for i in m.issues if len(i.title or "") > 30)
    
    return {
        'documented_issues': documented_issues,
        'documentation_rate': round((documented_issues / total_issues * 100), 2) if total_issues > 0 else 0
    }

def analyze_cross_team_work(milestones):
    """Analyze cross-team collaboration"""
    # Simplified analysis
    assignees = set()
    for milestone in milestones:
        for issue in milestone.issues:
            if issue.assignee:
                assignees.add(issue.assignee)
    
    return {
        'unique_assignees': len(assignees),
        'collaboration_diversity': 'high' if len(assignees) > 5 else 'medium' if len(assignees) > 3 else 'low'
    }

def estimate_mentorship_impact(milestones):
    """Estimate mentorship effectiveness"""
    # Simplified estimation
    total_issues = sum(len(m.issues) for m in milestones)
    complex_issues = sum(1 for m in milestones for i in m.issues if i.time_estimate and i.time_estimate > 16)
    
    return {
        'complex_issues_handled': complex_issues,
        'mentorship_opportunities': complex_issues,
        'effectiveness_score': round((complex_issues / total_issues * 100), 2) if total_issues > 0 else 0
    }

# ============================================================================
# ISSUES ENDPOINTS
# ============================================================================

@analytics_bp.route("/issues")
def get_all_issues():
    """Get all issues from all projects"""
    from models.models import Issue, Project, Milestone
    
    try:
        # Get all issues with related data
        issues = Issue.query.all()
        
        result = []
        for issue in issues:
            # Get project info
            project = Project.query.get(issue.project_id) if issue.project_id else None
            milestone = Milestone.query.get(issue.milestone_id) if issue.milestone_id else None
            
            issue_data = {
                "id": issue.id,
                "title": issue.title,
                "state": issue.state,
                "assignee": issue.assignee,
                "reporter": issue.reporter,
                "created_date": issue.created_date.isoformat() if issue.created_date else None,
                "closed_date": issue.closed_date.isoformat() if issue.closed_date else None,
                "time_estimate": issue.time_estimate,
                "time_spent": issue.time_spent,
                "labels": issue.labels or [],
                "issue_type": issue.issue_type,
                "priority": issue.priority,
                "description": issue.description,
                "project": {
                    "id": project.id,
                    "name": project.name,
                    "provider_type": project.provider_type,
                    "company_name": project.company_name
                } if project else None,
                "milestone": {
                    "id": milestone.id,
                    "title": milestone.title,
                    "start_date": milestone.start_date.isoformat() if milestone.start_date else None,
                    "due_date": milestone.due_date.isoformat() if milestone.due_date else None,
                    "state": milestone.state
                } if milestone else None
            }
            result.append(issue_data)
        
        return jsonify({
            "issues": result,
            "total_count": len(result),
            "open_count": len([i for i in result if i["state"] == "opened"]),
            "closed_count": len([i for i in result if i["state"] == "closed"]),
            "statistics": {
                "by_state": {
                    "opened": len([i for i in result if i["state"] == "opened"]),
                    "closed": len([i for i in result if i["state"] == "closed"])
                },
                "by_type": {},
                "by_priority": {},
                "total_time_estimate": sum(i["time_estimate"] or 0 for i in result),
                "total_time_spent": sum(i["time_spent"] or 0 for i in result)
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to get issues: {str(e)}"}), 500

# ============================================================================
# RELEASE PLANNING ROUTES
# ============================================================================

@analytics_bp.route("/analytics/release-planning/readiness/<int:release_id>")
@clerk_auth.require_auth
def release_readiness(release_id):
    """Calculate release readiness score"""
    from repositories.milestone_repository import get_milestone_by_id
    from services.analytics_service import calculate_code_quality_metrics, estimate_test_coverage
    
    # Get the release milestone
    release_milestone = get_milestone_by_id(release_id)
    if not release_milestone:
        return jsonify({"error": "Release not found"}), 404
    
    # Calculate actual readiness factors based on real data
    total_issues = len(release_milestone.issues)
    closed_issues = len([i for i in release_milestone.issues if i.state == "closed"])
    
    # Feature completeness based on closed issues
    feature_completeness = (closed_issues / total_issues * 100) if total_issues > 0 else 0
    
    # Test coverage estimation (simplified)
    test_coverage = estimate_test_coverage(release_milestone.project_id) if hasattr(release_milestone, 'project_id') else 75
    
    # Bug density calculation
    bug_issues = len([i for i in release_milestone.issues if i.issue_type and 'bug' in i.issue_type.lower()])
    bug_density = (bug_issues / total_issues * 100) if total_issues > 0 else 0
    
    # Documentation completeness (based on issue descriptions)
    documented_issues = len([i for i in release_milestone.issues if i.description and len(i.description) > 50])
    documentation_completeness = (documented_issues / total_issues * 100) if total_issues > 0 else 0
    
    # Stakeholder approval (simplified - could be based on approval workflows)
    stakeholder_approval = 85  # This would come from actual approval data
    
    readiness_factors = {
        'feature_completeness': round(feature_completeness, 2),
        'test_coverage': round(test_coverage, 2),
        'bug_density': round(bug_density, 2),
        'documentation_completeness': round(documentation_completeness, 2),
        'stakeholder_approval': stakeholder_approval
    }
    
    weights = {
        'feature_completeness': 0.3,
        'test_coverage': 0.25,
        'bug_density': 0.25,
        'documentation_completeness': 0.1,
        'stakeholder_approval': 0.1
    }
    
    readiness_score = sum(readiness_factors[key] * weights[key] for key in readiness_factors)
    
    return jsonify({
        'release_id': release_id,
        'release_title': release_milestone.title,
        'readiness_score': round(readiness_score, 2),
        'readiness_factors': readiness_factors,
        'weights': weights,
        'status': 'ready' if readiness_score >= 80 else 'needs_work' if readiness_score >= 60 else 'not_ready',
        'total_issues': total_issues,
        'closed_issues': closed_issues,
        'bug_issues': bug_issues
    })