export interface InboxHealthMetrics {
  total_unread: number;
  needs_reply_count: number;
  ai_summaries_count: number;
  followups_due_today: number;
  inbox_zero_percentage: number;
  avg_response_time_hours: number;
  safe_send_active: boolean;
}

export interface PriorityThreadItem {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  snippet: string;
  urgency: "Urgent" | "High" | "Medium";
  deadline: string;
  time_ago: string;
  category: string;
  resolved: boolean;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: "summary" | "reply" | "reminder" | "sync";
}

export interface DashboardOverviewResponse {
  metrics: InboxHealthMetrics;
  priority_queue: PriorityThreadItem[];
  recent_activity: RecentActivityItem[];
}

export interface TriageActionResponse {
  success: boolean;
  thread_id: string;
  message: string;
  updated_metrics: InboxHealthMetrics;
}
