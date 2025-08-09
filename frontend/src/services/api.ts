import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add fresh token to each request
apiClient.interceptors.request.use(
  async (config) => {
    // First try to get fresh token from Clerk function
    const getTokenFunction = (window as unknown as { __clerkGetToken?: () => Promise<string | null> }).__clerkGetToken;
    
    let token: string | null = null;
    
    if (getTokenFunction) {
      try {
        token = await getTokenFunction();
        if (token) {
          console.log('✅ Got fresh token from Clerk');
        } else {
          console.warn('⚠️ No token received from Clerk getToken()');
        }
      } catch (error) {
        console.error('❌ Error getting fresh token for request:', error);
      }
    }
    
    // Fallback: try localStorage if no fresh token
    if (!token) {
      const storedToken = localStorage.getItem('clerk-token');
      if (storedToken) {
        token = storedToken;
        console.log('🔄 Using fallback token from localStorage');
      }
    }
    
    // Set authorization header if we have a token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Authorization header set for request to:', config.url);
    } else {
      console.error('🚫 No token available for request to:', config.url);
      // Optional: You might want to reject the request or redirect to login
      // throw new Error('No authentication token available');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - user may need to re-authenticate');
      // Clear any cached tokens and let Clerk handle re-authentication
      localStorage.removeItem('clerk-token');
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface Sprint {
  milestone_id: number;
  title: string;
  total_issues: number;
  closed_issues: number;
  velocity_hours: number;
  avg_hours_per_issue: number;
}

export interface VelocityStats {
  sprints: Sprint[];
  total_issues_closed: number;
  average_velocity_hours: number;
  backlog_remaining_hours: number;
  estimated_sprints_to_finish_backlog: number;
}

export interface VelocityChart {
  chart_data: string;
  sprints: string[];
  velocities: number[];
}

export interface EpicProgress {
  epic_id: number;
  epic_title: string;
  progress_data: Array<{
    date: string;
    estimated_progress: number;
    actual_progress: number;
  }>;
}

export interface PeriodSuccess {
  epic_id: number;
  from_date: string;
  to_date: string;
  successful: boolean;
  total_issues: number;
  closed_issues: number;
}

export interface EpicSuccess {
  epic_id: number;
  epic_title: string;
  successful: boolean;
}

export interface DeveloperSuccess {
  milestone_id: number;
  milestone_title: string;
  developers: Array<{
    developer: string;
    weeks: Array<{
      week: string;
      closed: number;
      total: number;
      percent: number;
      successful: boolean;
    }>;
  }>;
}

export interface DeveloperSummary {
  developer: string;
  total_issues: number;
  closed_issues: number;
  progress_percent: number;
  successful: boolean;
}

export interface EpicStatus {
  epic_id: number;
  epic_title: string;
  start_date: string;
  due_date: string;
  successful: boolean;
  milestones: Array<{
    milestone_id: number;
    title: string;
    total_issues: number;
    closed_issues: number;
    progress_percent: number;
    successful: boolean;
  }>;
}

export interface Milestone {
  id: number;
  title: string;
  start_date: string;
  due_date: string;
  issues: Array<{
    id: number;
    title: string;
    state: string;
    assignee: string;
    closed_date: string | null;
    milestone_id: number;
  }>;
}

export interface MilestoneSuccess {
  milestone_id: number;
  title: string;
  successful: boolean;
}

export interface GitLabVelocity {
  milestone_id: number;
  milestone_title: string;
  total_issues: number;
  closed_issues: number;
  total_estimated_hours: number;
  total_spent_hours: number;
  velocity_estimated_hours: number;
  velocity_spent_hours: number;
  estimation_accuracy_percent: number;
  avg_hours_per_issue: number;
}

export interface TeamCapacity {
  team_member: string;
  total_issues: number;
  closed_issues: number;
  total_estimated_hours: number;
  total_spent_hours: number;
  velocity_hours: number;
  estimation_accuracy_percent: number;
  avg_hours_per_issue: number;
  completion_rate: number;
}

export interface IssueTypeAnalysis {
  issue_type: string;
  total_count: number;
  closed_count: number;
  total_estimated_hours: number;
  total_spent_hours: number;
  velocity_hours: number;
  estimation_accuracy_percent: number;
  avg_hours_per_issue: number;
  completion_rate: number;
}

export interface PriorityAnalysis {
  priority: string;
  total_count: number;
  closed_count: number;
  total_estimated_hours: number;
  total_spent_hours: number;
  velocity_hours: number;
  estimation_accuracy_percent: number;
  avg_hours_per_issue: number;
  completion_rate: number;
}

export interface BurndownData {
  milestone_id: number;
  milestone_title: string;
  total_estimated_hours: number;
  start_date: string;
  end_date: string;
  burndown_data: Array<{
    date: string;
    actual_remaining_hours: number;
    ideal_remaining_hours: number;
    day_number: number;
  }>;
}

export interface LeadTimeAnalysis {
  total_issues_analyzed: number;
  average_lead_time_days: number;
  median_lead_time_days: number;
  min_lead_time_days: number;
  max_lead_time_days: number;
  lead_time_std_dev: number;
  issues: unknown[];
}

export interface ThroughputAnalysis {
  analysis_period_days: number;
  start_date: string;
  end_date: string;
  total_issues_completed: number;
  average_daily_throughput: number;
  average_weekly_throughput: number;
  daily_throughput: unknown;
  weekly_throughput: unknown;
}

export interface DefectRateAnalysis {
  total_issues: number;
  total_closed_issues: number;
  defect_rate_percent: number;
  closed_defect_rate_percent: number;
  issue_type_breakdown: Record<string, number>;
  closed_issue_type_breakdown: Record<string, number>;
}

export interface VelocityForecast {
  historical_velocities: number[];
  average_velocity_hours: number;
  velocity_trend: number;
  forecasts: Array<{
    sprint_number: number;
    forecasted_velocity_hours: number;
    confidence_level: string;
  }>;
}

export interface TeamVelocityTrends {
  [developer: string]: {
    average_velocity_hours: number;
    velocity_trend: number;
    sprints_analyzed: number;
    velocity_history: unknown[];
  };
}

export interface SprintHealth {
  milestone_id: number;
  milestone_title: string;
  health_status: string;
  completion_rate_percent: number;
  estimation_accuracy_percent: number;
  progress_percentage: number;
  total_issues: number;
  closed_issues: number;
  total_estimated_hours: number;
  total_spent_hours: number;
  velocity_hours: number;
  days_elapsed: number;
  total_days: number;
  days_remaining: number;
}

// Sprint Planning Interfaces
export interface SprintPlanningCapacity {
  [member: string]: {
    historical_velocity: number;
    available_hours: number;
    recommended_capacity: number;
    sprint_duration: number;
    team_member: string;
  };
}

export interface SprintPlanningCommitment {
  total_capacity: number;
  total_estimated_effort: number;
  recommended_commitment: number;
  commitment_probability: number;
  risk_level: 'low' | 'medium' | 'high';
  accuracy_factor: number;
  sprint_duration: number;
  team_size: number;
  team_breakdown?: Record<string, {
    utilization: 'optimal' | 'underutilized' | 'overutilized';
  }>;
}

export interface DashboardOverview {
  summary: {
    total_projects: number;
    total_milestones: number;
    total_epics: number;
    total_issues: number;
    total_closed_issues: number;
    total_estimated_hours: number;
    total_spent_hours: number;
    overall_completion_rate: number;
    estimation_accuracy: number;
  };
  recent_activity: unknown[];
  health_indicators: {
    completion_rate_status: string;
    estimation_accuracy_status: string;
  };
}

export interface TeamDashboard {
  team_capacity: TeamCapacity[];
  team_performance: unknown[];
  lead_time_summary: {
    average_lead_time_days: number;
    total_issues_analyzed: number;
  };
  throughput_summary: {
    total_issues_completed: number;
    average_daily_throughput: number;
    average_weekly_throughput: number;
  };
}

export interface SprintDashboard {
  current_sprint: {
    id: number;
    title: string;
    start_date: string;
    due_date: string;
    progress: unknown;
  };
  upcoming_sprints: unknown[];
  recent_completed_sprints: unknown[];
  velocity_summary: {
    average_velocity_hours: number;
    total_sprints_analyzed: number;
  };
  defect_summary: {
    defect_rate_percent: number;
    total_issues: number;
  };
}

export interface HealthDashboard {
  sprint_health: SprintHealth[];
  epic_health: unknown[];
  overall_health: {
    health_score: number;
    health_status: string;
    total_sprints: number;
    excellent_sprints: number;
    good_sprints: number;
  };
}

export interface Epic {
  id: number;
  title: string;
  start_date: string;
  due_date: string;
  project_id: number;
}

export interface GitLabImportRequest {
  project_ids: number[];
  gitlab_url?: string;
  access_token: string;
}

export interface GitLabImportResponse {
  message: string;
  results: Array<{
    project_id: number;
    milestones_imported: number;
    issues_imported: number;
  }>;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface TokenVerification {
  valid: boolean;
  user: {
    id: string;
    email: string;
  };
}

// Developer Management Interfaces
export interface Developer {
  id: number;
  name: string;
  email: string;
  provider_type: string;
  provider_username: string;
  provider_user_id?: string;
  provider_data?: Record<string, unknown>;
  working_hours_per_day: number;
  working_days_per_week: number;
  availability_factor: number;
  experience_level: string;
  hourly_rate: number;
  team_name: string;
  project_id: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

export interface CreateDeveloperRequest {
  name: string;
  email: string;
  provider_type: string;
  provider_username: string;
  working_hours_per_day: number;
  working_days_per_week: number;
  availability_factor: number;
  experience_level: string;
  hourly_rate: number;
  team_name: string;
  project_id: number;
}

export interface UpdateDeveloperRequest {
  working_hours_per_day?: number;
  working_days_per_week?: number;
  availability_factor?: number;
  experience_level?: string;
  hourly_rate?: number;
  team_name?: string;
  is_active?: boolean;
}

export interface DeveloperCapacity {
  developer_name: string;
  sprint_duration_weeks: number;
  capacity_config: {
    working_hours_per_day: number;
    working_days_per_week: number;
    availability_factor: number;
    experience_level: string;
    hourly_rate: number;
  };
  calculated_capacity: {
    total_working_hours: number;
    available_hours: number;
    daily_capacity: number;
    weekly_capacity: number;
  };
}

export interface BulkCapacityRequest {
  team_members: string[];
  sprint_duration: number;
}

export interface BulkCapacityResponse {
  team_capacity: Record<string, {
    historical_velocity?: number;
    available_hours: number;
    recommended_capacity: number;
    working_hours_per_day: number;
    working_days_per_week: number;
    availability_factor: number;
  }>;
  sprint_duration: number;
  total_capacity: number;
  total_available_hours: number;
}

// Provider Integration Interfaces
export interface ProviderConfig {
  provider_type: string;
  provider_url: string;
  access_token: string;
  provider_config?: Record<string, unknown>;
  company_name?: string;
  company_domain?: string;
}

export interface ImportDevelopersResponse {
  message: string;
  project_id: number;
  provider_type: string;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  total_processed: number;
  errors: string[];
  sync_operation?: boolean;
}

export interface PreviewImportRequest {
  provider_type: string;
  provider_url: string;
  access_token: string;
  external_project_id?: string;
}

export interface PreviewImportResponse {
  preview_users: Array<{
    username: string;
    name: string;
    email: string;
    is_active: boolean;
    will_be_imported: boolean;
  }>;
  total_users_found: number;
  active_users_count: number;
  inactive_users_count: number;
  provider_type: string;
}

export interface ProviderInfo {
  type: string;
  name: string;
  description: string;
  default_url: string;
  supports: string[];
}

export interface ConnectionTestResponse {
  connection_status: boolean;
  provider_type: string;
  provider_url: string;
}

export interface ImportStatusResponse {
  project_id: number;
  project_name: string;
  provider_type: string;
  provider_url: string;
  provider_configured: boolean;
  provider_connection_status: boolean;
  total_developers: number;
  active_developers: number;
  company_name?: string;
  company_domain?: string;
}

// Provider Mapping Interfaces
export interface ProviderMapping {
  provider: string;
  mappings: Record<string, string>;
  total_mappings: number;
}

export interface CreateMappingRequest {
  developer_name: string;
  external_username: string;
}

export interface SuggestMappingsRequest {
  external_usernames: string[];
}

export interface SuggestMappingsResponse {
  provider: string;
  suggestions: Record<string, string[]>;
  unmapped_users: string[];
}

export interface AutoMapRequest {
  issues_data: Array<{
    assignee?: string;
    reporter?: string;
    title: string;
  }>;
}

export interface AutoMapResponse {
  provider: string;
  auto_mappings: Record<string, string>;
  mapped_count: number;
  message: string;
}

export interface ResolveUserResponse {
  provider: string;
  external_username: string;
  resolved_developer: Developer;
  all_provider_mappings: Record<string, string>;
}

export interface BulkImportMappingsRequest {
  [provider: string]: Record<string, string>;
}

export interface AllDevelopersWithMappingsResponse {
  developers: Array<Developer & {
    provider_mappings: Record<string, string>;
    supported_providers: string[];
  }>;
  total_developers: number;
}

// Advanced Analytics Interfaces
export interface QualityMetrics {
  total_issues: number;
  code_coverage_percent?: number;
  technical_debt_hours?: number;
  bug_rate_percent: number;
  test_pass_rate?: number;
  code_review_coverage?: number;
}

export interface TechnicalDebtImpact {
  total_technical_debt_hours: number;
  impact_on_velocity_percent: number;
  debt_trend: 'increasing' | 'decreasing' | 'stable';
  critical_debt_items: Array<{
    id: string;
    title: string;
    debt_hours: number;
    priority: string;
  }>;
}

export interface RiskAnalysis {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: Array<{
    factor: string;
    impact: number;
    probability: number;
    mitigation: string;
  }>;
  overall_risk_score: number;
}

export interface RetrospectiveAnalysis {
  sprint_id: number;
  sprint_title: string;
  what_went_well: string[];
  what_went_wrong: string[];
  action_items: string[];
  team_sentiment: 'positive' | 'neutral' | 'negative';
  velocity_trend: number;
}

export interface BusinessValueMetrics {
  total_business_value: number;
  value_per_sprint: number;
  roi_percentage: number;
  cost_per_story_point: number;
  value_delivery_trend: number;
}

export interface BacklogPrioritization {
  high_value_items: Array<{
    id: string;
    title: string;
    business_value: number;
    effort: number;
  }>;
  quick_wins: Array<{
    id: string;
    title: string;
    business_value: number;
    effort: number;
  }>;
  major_projects: Array<{
    id: string;
    title: string;
    business_value: number;
    effort: number;
  }>;
  fill_ins: Array<{
    id: string;
    title: string;
    business_value: number;
    effort: number;
  }>;
  prioritization_matrix: Record<string, unknown>;
}

export interface CollaborationAnalysis {
  team_collaboration_score: number;
  pair_programming_frequency: number;
  code_review_participation: number;
  knowledge_sharing_score: number;
  communication_effectiveness: number;
}

export interface Project {
  id: number;
  name: string;
  milestone_count: number;
  epic_count: number;
  issue_count: number;
}

export interface ProjectMilestone {
  id: number;
  title: string;
  start_date: string;
  due_date: string;
  project_id: number;
  issue_count: number;
  closed_issue_count: number;
}

export interface ProjectEpic {
  id: number;
  title: string;
  start_date: string;
  due_date: string;
  project_id: number;
  milestone_count: number;
}

// API Service Class
export class GitLabAnalyticsAPI {
  // Authentication - Now handled by Clerk
  // JWT tokens are automatically managed by the useAuth hook

  // Health Check
  static async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  }

  // Core Analytics
  static async getVelocityStats(backlog?: number, projectId?: number): Promise<VelocityStats> {
    const params: Record<string, number> = {};
    if (backlog) params.backlog = backlog;
    if (projectId) params.project_id = projectId;
    
    const response = await apiClient.get('/analytics/velocity/stats', { 
      params
    });
    return response.data;
  }

  static async getVelocityChart(projectId?: number): Promise<VelocityChart> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/velocity/chart', { 
      params
    });
    return response.data;
  }

  static async getEpicProgress(epicId: number, projectId?: number): Promise<Array<{
    date: string;
    estimated: number;
    actual: number;
  }>> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get(`/epic/progress/${epicId}`, { 
      params,

    });
    return response.data;
  }

  static async checkPeriodSuccess(
    epicId: number,
    fromDate: string,
    toDate: string,
    projectId?: number
  ): Promise<PeriodSuccess> {
    const params: Record<string, string | number> = { from_date: fromDate, to_date: toDate };
    if (projectId) params.project_id = projectId;
    const response = await apiClient.get(`/analytics/period-success/${epicId}`, { 
      params,

    });
    return response.data;
  }

  static async getEpicSuccess(projectId?: number): Promise<EpicSuccess[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/epic-success', { 
      params,

    });
    return response.data;
  }

  static async getDeveloperSuccess(projectId?: number): Promise<DeveloperSuccess[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/developer-success', { 
      params,

    });
    return response.data;
  }

  static async getDeveloperSummary(projectId?: number): Promise<DeveloperSummary[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/developer-summary', { 
      params,

    });
    return response.data;
  }

  static async getEpicStatus(projectId?: number): Promise<EpicStatus[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/epic-status', { 
      params,

    });
    return response.data;
  }

  static async getMilestones(projectId?: number): Promise<Milestone[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/milestones', { 
      params,

    });
    return response.data;
  }

  static async getMilestoneSuccess(projectId?: number): Promise<MilestoneSuccess[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/milestone-success', { 
      params,

    });
    return response.data;
  }

  // GitLab Time-Based Analytics
  static async getGitLabVelocity(projectId?: number): Promise<GitLabVelocity[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/gitlab/velocity', { 
      params,

    });
    return response.data;
  }

  static async getTeamCapacity(projectId?: number): Promise<TeamCapacity[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/team-capacity', { 
      params,

    });
    return response.data;
  }

  static async getIssueTypeAnalysis(projectId?: number): Promise<IssueTypeAnalysis[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/issue-type-analysis', { 
      params,

    });
    return response.data;
  }

  static async getPriorityAnalysis(projectId?: number): Promise<PriorityAnalysis[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/priority-analysis', { 
      params,

    });
    return response.data;
  }

  static async getBurndownData(milestoneId: number, projectId?: number): Promise<BurndownData> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get(`/analytics/burndown/${milestoneId}`, { 
      params,

    });
    return response.data;
  }

  // Advanced Analytics
  static async getLeadTimeAnalysis(projectId?: number): Promise<LeadTimeAnalysis> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/lead-time', { 
      params,

    });
    return response.data;
  }

  static async getThroughputAnalysis(days?: number, projectId?: number): Promise<ThroughputAnalysis> {
    const params: Record<string, number> = {};
    if (days) params.days = days;
    if (projectId) params.project_id = projectId;
    const response = await apiClient.get('/analytics/throughput', { 
      params,

    });
    return response.data;
  }

  static async getDefectRateAnalysis(projectId?: number): Promise<DefectRateAnalysis> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/defect-rate', { 
      params,

    });
    return response.data;
  }

  static async getVelocityForecast(sprintsAhead?: number, projectId?: number): Promise<VelocityForecast> {
    const params: Record<string, number> = {};
    if (sprintsAhead) params.sprints_ahead = sprintsAhead;
    if (projectId) params.project_id = projectId;
    const response = await apiClient.get('/analytics/velocity-forecast', { 
      params,

    });
    return response.data;
  }

  static async getTeamVelocityTrends(projectId?: number): Promise<TeamVelocityTrends> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/team-velocity-trends', { 
      params,

    });
    return response.data;
  }

  static async getSprintHealth(milestoneId: number, projectId?: number): Promise<SprintHealth> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get(`/analytics/sprint-health/${milestoneId}`, { 
      params,

    });
    return response.data;
  }

  // Dashboard Endpoints
  static async getDashboardOverview(projectId?: number): Promise<DashboardOverview> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/dashboard/overview', { 
      params,

    });
    return response.data;
  }

  static async getTeamDashboard(projectId?: number): Promise<TeamDashboard> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/dashboard/team', { 
      params,

    });
    return response.data;
  }

  static async getSprintDashboard(projectId?: number): Promise<SprintDashboard> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/dashboard/sprint', { 
      params,

    });
    return response.data;
  }

  static async getHealthDashboard(projectId?: number): Promise<HealthDashboard> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/dashboard/health', { 
      params,

    });
    return response.data;
  }

  // Sprint Planning Endpoints
  static async getSprintPlanningCapacity(sprintDuration: number, teamMembers: string[], projectId?: number): Promise<SprintPlanningCapacity> {
    const params = new URLSearchParams();
    params.append('sprint_duration', sprintDuration.toString());
    teamMembers.forEach((member) => {
      params.append('team_members', member);
    });
    if (projectId) params.append('project_id', projectId.toString());
    
    const response = await apiClient.get(`/analytics/sprint-planning/capacity?${params.toString()}`, { 

    });
    return response.data;
  }

  static async getSprintPlanningCommitment(sprintDuration: number, teamMembers: string[], projectId?: number): Promise<SprintPlanningCommitment> {
    const params = new URLSearchParams();
    params.append('sprint_duration', sprintDuration.toString());
    teamMembers.forEach((member) => {
      params.append('team_members', member);
    });
    if (projectId) params.append('project_id', projectId.toString());
    
    const response = await apiClient.get(`/analytics/sprint-planning/commitment?${params.toString()}`, { 

    });
    return response.data;
  }

  // Basic Data Endpoints
  static async getEpics(projectId?: number): Promise<Epic[]> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/epic-status', { 
      params,

    });
    return response.data.map((epic: { epic_id: number; epic_title: string; start_date: string; due_date: string }) => ({
      id: epic.epic_id,
      title: epic.epic_title,
      start_date: epic.start_date,
      due_date: epic.due_date,
    }));
  }

  static async getProjects(): Promise<Project[]> {
    const response = await apiClient.get('/analytics/projects');
    return response.data;
  }

  static async getProjectMilestones(projectId: number): Promise<ProjectMilestone[]> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/milestones`);
    return response.data;
  }

  static async getProjectEpics(projectId: number): Promise<ProjectEpic[]> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/epics`);
    return response.data;
  }

  static async getMilestonesList(): Promise<Milestone[]> {
    const response = await apiClient.get('/milestones');
    return response.data;
  }

  // GitLab Integration
  static async importFromGitLab(data: GitLabImportRequest): Promise<GitLabImportResponse> {
    const response = await apiClient.post('/import/gitlab', data);
    return response.data;
  }

  // Authentication Endpoints
  static async getUserProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  static async verifyToken(token: string): Promise<TokenVerification> {
    const response = await apiClient.post('/auth/verify', { token });
    return response.data;
  }

  static async getProtectedRoute(): Promise<unknown> {
    const response = await apiClient.get('/auth/protected');
    return response.data;
  }

  static async getOptionalAuthRoute(): Promise<unknown> {
    const response = await apiClient.get('/auth/optional');
    return response.data;
  }

  // Developer Management Endpoints
  static async getAllDevelopers(projectId?: number, teamName?: string): Promise<Developer[]> {
    const params: Record<string, string | number> = {};
    if (projectId) params.project_id = projectId;
    if (teamName) params.team_name = teamName;
    const response = await apiClient.get('/developers', { params });
    return response.data;
  }

  static async getDeveloperByName(name: string): Promise<Developer> {
    const response = await apiClient.get(`/developers/${name}`);
    return response.data;
  }

  static async createDeveloper(data: CreateDeveloperRequest): Promise<{ message: string; developer: Developer }> {
    const response = await apiClient.post('/developers', data);
    return response.data;
  }

  static async updateDeveloper(developerId: number, data: UpdateDeveloperRequest): Promise<{ message: string; developer: Developer }> {
    const response = await apiClient.put(`/developers/${developerId}`, data);
    return response.data;
  }

  static async getDeveloperCapacity(name: string, sprintDuration?: number): Promise<DeveloperCapacity> {
    const params = sprintDuration ? { sprint_duration: sprintDuration } : {};
    const response = await apiClient.get(`/developers/${name}/capacity`, { params });
    return response.data;
  }

  static async getAllTeams(): Promise<string[]> {
    const response = await apiClient.get('/developers/teams');
    return response.data;
  }

  static async getBulkCapacity(data: BulkCapacityRequest): Promise<BulkCapacityResponse> {
    const response = await apiClient.post('/developers/capacity/bulk', data);
    return response.data;
  }

  // Provider Integration Endpoints
  static async importDevelopersFromProvider(projectId: number): Promise<ImportDevelopersResponse> {
    const response = await apiClient.post(`/projects/${projectId}/import-developers`);
    return response.data;
  }

  static async importDevelopersWithCustomConfig(projectId: number, config: ProviderConfig): Promise<ImportDevelopersResponse> {
    const response = await apiClient.post(`/projects/${projectId}/import-developers/custom`, config);
    return response.data;
  }

  static async updateProjectProviderConfig(projectId: number, config: ProviderConfig): Promise<{ message: string; project_id: number }> {
    const response = await apiClient.put(`/projects/${projectId}/provider-config`, config);
    return response.data;
  }

  static async getProjectProviderConfig(projectId: number): Promise<Project & ProviderConfig> {
    const response = await apiClient.get(`/projects/${projectId}/provider-config`);
    return response.data;
  }

  static async getImportStatus(projectId: number): Promise<ImportStatusResponse> {
    const response = await apiClient.get(`/projects/${projectId}/import-status`);
    return response.data;
  }

  static async getAvailableProviders(): Promise<{ providers: ProviderInfo[]; total_providers: number }> {
    const response = await apiClient.get('/providers/available');
    return response.data;
  }

  static async testProviderConnection(projectId: number, config?: ProviderConfig): Promise<ConnectionTestResponse> {
    const response = await apiClient.post(`/projects/${projectId}/test-provider-connection`, config || {});
    return response.data;
  }

  static async previewImport(projectId: number, config: PreviewImportRequest): Promise<PreviewImportResponse> {
    const response = await apiClient.post(`/projects/${projectId}/preview-import`, config);
    return response.data;
  }

  static async syncDevelopers(projectId: number): Promise<ImportDevelopersResponse> {
    const response = await apiClient.post(`/projects/${projectId}/sync-developers`);
    return response.data;
  }

  // Provider Mapping Endpoints
  static async getProviderMappings(providerName: string): Promise<ProviderMapping> {
    const response = await apiClient.get(`/provider-mappings/${providerName}`);
    return response.data;
  }

  static async createProviderMapping(providerName: string, data: CreateMappingRequest): Promise<{ message: string; provider: string; developer_name: string; external_username: string }> {
    const response = await apiClient.post(`/provider-mappings/${providerName}/map`, data);
    return response.data;
  }

  static async suggestMappings(providerName: string, data: SuggestMappingsRequest): Promise<SuggestMappingsResponse> {
    const response = await apiClient.post(`/provider-mappings/${providerName}/suggest`, data);
    return response.data;
  }

  static async autoMapFromData(providerName: string, data: AutoMapRequest): Promise<AutoMapResponse> {
    const response = await apiClient.post(`/provider-mappings/${providerName}/auto-map`, data);
    return response.data;
  }

  static async resolveExternalUser(providerName: string, externalUsername: string): Promise<ResolveUserResponse> {
    const response = await apiClient.get(`/provider-mappings/${providerName}/resolve/${externalUsername}`);
    return response.data;
  }

  static async bulkImportMappings(data: BulkImportMappingsRequest): Promise<{ message: string; results: Record<string, unknown> }> {
    const response = await apiClient.post('/provider-mappings/bulk-import', data);
    return response.data;
  }

  static async getAllDevelopersWithMappings(): Promise<AllDevelopersWithMappingsResponse> {
    const response = await apiClient.get('/provider-mappings/all-developers');
    return response.data;
  }

  // Advanced Analytics Endpoints
  static async getQualityMetrics(projectId?: number): Promise<QualityMetrics> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/quality/metrics', { params });
    return response.data;
  }

  static async getTechnicalDebtImpact(projectId?: number): Promise<TechnicalDebtImpact> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/quality/tech-debt-impact', { params });
    return response.data;
  }

  static async getSprintRisks(sprintId: number): Promise<RiskAnalysis> {
    const response = await apiClient.get(`/analytics/risks/sprint/${sprintId}`);
    return response.data;
  }

  static async getProjectRisks(projectId: number): Promise<RiskAnalysis> {
    const response = await apiClient.get(`/analytics/risks/project/${projectId}`);
    return response.data;
  }

  static async getSprintRetrospective(sprintId: number): Promise<RetrospectiveAnalysis> {
    const response = await apiClient.get(`/analytics/retrospective/${sprintId}`);
    return response.data;
  }

  static async getRetrospectiveActions(sprintId: number): Promise<Array<{ id: string; action: string; status: string; assignee?: string }>> {
    const response = await apiClient.get(`/analytics/retrospective/actions/${sprintId}`);
    return response.data;
  }

  static async getRetrospectiveTrends(projectId?: number): Promise<Array<{ period: string; sentiment: string; improvement_score: number }>> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/retrospective/trends', { params });
    return response.data;
  }

  static async getBusinessValueMetrics(projectId?: number): Promise<BusinessValueMetrics> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/business-value/metrics', { params });
    return response.data;
  }

  static async getBacklogPrioritization(projectId?: number): Promise<BacklogPrioritization> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/business-value/backlog-prioritization', { params });
    return response.data;
  }

  static async getROITrends(projectId?: number): Promise<Array<{ period: string; roi_percentage: number; investment: number; return: number }>> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/business-value/roi-trends', { params });
    return response.data;
  }

  static async getTeamCollaborationAnalysis(projectId?: number): Promise<CollaborationAnalysis> {
    const params = projectId ? { project_id: projectId } : {};
    const response = await apiClient.get('/analytics/collaboration/team-analysis', { params });
    return response.data;
  }

  static async getReleasePlanningReadiness(releaseId: number): Promise<{ release_id: number; readiness_score: number; blockers: string[]; estimated_completion: string }> {
    const response = await apiClient.get(`/analytics/release-planning/readiness/${releaseId}`);
    return response.data;
  }

  // Project-Specific Enhanced Endpoints
  static async getProjectGitLabVelocity(projectId: number): Promise<GitLabVelocity[]> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/gitlab/velocity`);
    return response.data;
  }

  static async getProjectTeamCapacity(projectId: number): Promise<TeamCapacity[]> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/gitlab/team-capacity`);
    return response.data;
  }

  static async getProjectIssueTypes(projectId: number): Promise<IssueTypeAnalysis[]> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/gitlab/issue-types`);
    return response.data;
  }

  static async getProjectPriorities(projectId: number): Promise<PriorityAnalysis[]> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/gitlab/priorities`);
    return response.data;
  }

  static async getProjectBurndown(projectId: number, milestoneId: number): Promise<BurndownData> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/gitlab/burndown/${milestoneId}`);
    return response.data;
  }

  static async getProjectLeadTime(projectId: number): Promise<LeadTimeAnalysis> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/lead-time`);
    return response.data;
  }

  static async getProjectThroughput(projectId: number, days?: number): Promise<ThroughputAnalysis> {
    const params = days ? { days } : {};
    const response = await apiClient.get(`/analytics/projects/${projectId}/throughput`, { params });
    return response.data;
  }

  static async getProjectDefectRate(projectId: number): Promise<DefectRateAnalysis> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/defect-rate`);
    return response.data;
  }

  static async getProjectVelocityForecast(projectId: number, sprintsAhead?: number): Promise<VelocityForecast> {
    const params = sprintsAhead ? { sprints_ahead: sprintsAhead } : {};
    const response = await apiClient.get(`/analytics/projects/${projectId}/velocity-forecast`, { params });
    return response.data;
  }

  static async getProjectTeamVelocityTrends(projectId: number): Promise<TeamVelocityTrends> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/team-velocity-trends`);
    return response.data;
  }

  static async getProjectSprintHealth(projectId: number, milestoneId: number): Promise<SprintHealth> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/sprint-health/${milestoneId}`);
    return response.data;
  }

  static async getProjectDashboardOverview(projectId: number): Promise<DashboardOverview> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/dashboard/overview`);
    return response.data;
  }

  static async getProjectTeamDashboard(projectId: number): Promise<TeamDashboard> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/dashboard/team`);
    return response.data;
  }

  static async getProjectSprintDashboard(projectId: number): Promise<SprintDashboard> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/dashboard/sprint`);
    return response.data;
  }

  static async getProjectHealthDashboard(projectId: number): Promise<HealthDashboard> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/dashboard/health`);
    return response.data;
  }

  static async getProjectRetrospective(projectId: number, sprintId: number): Promise<RetrospectiveAnalysis> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/retrospective/${sprintId}`);
    return response.data;
  }

  static async getProjectRetrospectiveActions(projectId: number, sprintId: number): Promise<Array<{ id: string; action: string; status: string; assignee?: string }>> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/retrospective/actions/${sprintId}`);
    return response.data;
  }

  static async getProjectRetrospectiveTrends(projectId: number): Promise<Array<{ period: string; sentiment: string; improvement_score: number }>> {
    const response = await apiClient.get(`/analytics/projects/${projectId}/retrospective/trends`);
    return response.data;
  }
}

export default GitLabAnalyticsAPI; 