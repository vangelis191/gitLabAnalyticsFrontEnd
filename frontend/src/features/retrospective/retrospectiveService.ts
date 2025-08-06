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

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface RetrospectiveInsights {
  sprint_id: number;
  sprint_title: string;
  completion_rate: number;
  estimation_accuracy: number;
  what_went_well: string[];
  what_could_improve: string[];
  action_items: string[];
  team_sentiment: string;
  process_improvements: string[];
  metrics?: {
    total_issues: number;
    closed_issues: number;
    estimated_hours: number;
    spent_hours: number;
    average_issue_completion_time: number;
    bug_count: number;
    story_count: number;
    task_count: number;
  };
}

export interface RetrospectiveTrends {
  completion_rates: number[];
  estimation_accuracies: number[];
  sprint_titles: string[];
  overall_trend: string;
}

export interface ActionItemEffectiveness {
  sprint_id: number;
  action_items: string[];
  effectiveness: Record<string, {
    status: string;
    effectiveness_score: number;
    follow_up_needed: boolean;
    recommendations: string[];
  }>;
  overall_effectiveness: number;
}

export class RetrospectiveService {
  /**
   * Get retrospective insights for a specific sprint
   */
  static async getSprintRetrospective(sprintId: number, projectId?: number): Promise<RetrospectiveInsights> {
    try {
      if (projectId) {
        const response = await apiClient.get(
          `/analytics/projects/${projectId}/retrospective/${sprintId}`
        );
        return response.data;
      } else {
        const response = await apiClient.get(
          `/analytics/retrospective/${sprintId}`
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching sprint retrospective:', error);
      throw new Error('Failed to fetch sprint retrospective data');
    }
  }

  /**
   * Get retrospective trends across multiple sprints
   */
  static async getRetrospectiveTrends(projectId?: number, sprintsCount: number = 5): Promise<RetrospectiveTrends> {
    try {
      const params = new URLSearchParams();
      if (sprintsCount) {
        params.append('sprints_count', sprintsCount.toString());
      }

      if (projectId) {
        const response = await apiClient.get(
          `/analytics/projects/${projectId}/retrospective/trends?${params.toString()}`
        );
        return response.data;
      } else {
        const response = await apiClient.get(
          `/analytics/retrospective/trends?${params.toString()}`
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching retrospective trends:', error);
      throw new Error('Failed to fetch retrospective trends data');
    }
  }

  /**
   * Track effectiveness of retrospective action items
   */
  static async trackActionItemEffectiveness(
    sprintId: number,
    actionItems: string[],
    followUpSprints: number[],
    projectId?: number
  ): Promise<ActionItemEffectiveness> {
    try {
      const payload = {
        action_items: actionItems,
        follow_up_sprints: followUpSprints
      };

      if (projectId) {
        const response = await apiClient.post(
          `/analytics/projects/${projectId}/retrospective/actions/${sprintId}`,
          payload
        );
        return response.data;
      } else {
        const response = await apiClient.post(
          `/analytics/retrospective/actions/${sprintId}`,
          payload
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error tracking action item effectiveness:', error);
      throw new Error('Failed to track action item effectiveness');
    }
  }

  /**
   * Get available sprints for retrospective analysis
   */
  static async getAvailableSprints(projectId?: number): Promise<Array<{ id: number; title: string }>> {
    try {
      if (projectId) {
        const response = await apiClient.get(
          `/analytics/projects/${projectId}/milestones`
        );
        return response.data.map((milestone: { id: number; title: string }) => ({
          id: milestone.id,
          title: milestone.title
        }));
      } else {
        const response = await apiClient.get(
          '/analytics/milestones'
        );
        return response.data.map((milestone: { id: number; title: string }) => ({
          id: milestone.id,
          title: milestone.title
        }));
      }
    } catch (error) {
      console.error('Error fetching available sprints:', error);
      throw new Error('Failed to fetch available sprints');
    }
  }

  /**
   * Get comprehensive retrospective data for a project
   */
  static async getProjectRetrospectiveData(projectId: number): Promise<{
    sprints: Array<{ id: number; title: string }>;
    trends: RetrospectiveTrends;
    recentRetrospectives: RetrospectiveInsights[];
  }> {
    try {
      const [sprints, trends] = await Promise.all([
        this.getAvailableSprints(projectId),
        this.getRetrospectiveTrends(projectId, 5)
      ]);

      // Get retrospective data for the 3 most recent sprints
      const recentSprints = sprints.slice(-3);
      const recentRetrospectives = await Promise.all(
        recentSprints.map(sprint => 
          this.getSprintRetrospective(sprint.id, projectId).catch(() => null)
        )
      );

      return {
        sprints,
        trends,
        recentRetrospectives: recentRetrospectives.filter(Boolean) as RetrospectiveInsights[]
      };
    } catch (error) {
      console.error('Error fetching project retrospective data:', error);
      throw new Error('Failed to fetch project retrospective data');
    }
  }


} 