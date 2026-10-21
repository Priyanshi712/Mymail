from typing import Literal, Optional
from pydantic import BaseModel, Field


class InboxHealthMetrics(BaseModel):
    total_unread: int = Field(..., description="Total unread messages in inbox")
    needs_reply_count: int = Field(..., description="Threads requiring direct response")
    ai_summaries_count: int = Field(..., description="AI distilled summaries ready")
    followups_due_today: int = Field(..., description="Scheduled reminders due today")
    inbox_zero_percentage: float = Field(..., description="Progress percentage towards inbox triage")
    avg_response_time_hours: float = Field(..., description="Average response turnaround time in hours")
    safe_send_active: bool = Field(True, description="Human-in-the-loop safety status")


class PriorityThreadItem(BaseModel):
    id: str
    sender_name: str
    sender_email: str
    subject: str
    snippet: str
    urgency: Literal["Urgent", "High", "Medium"]
    deadline: str
    time_ago: str
    category: str
    resolved: bool = False


class RecentActivityItem(BaseModel):
    id: str
    action: str
    description: str
    timestamp: str
    type: Literal["summary", "reply", "reminder", "sync"]


class DashboardOverviewResponse(BaseModel):
    metrics: InboxHealthMetrics
    priority_queue: list[PriorityThreadItem]
    recent_activity: list[RecentActivityItem]


class TriageActionRequest(BaseModel):
    action: Literal["resolve", "snooze", "drafted"] = "resolve"
    note: Optional[str] = None


class TriageActionResponse(BaseModel):
    success: bool
    thread_id: str
    message: str
    updated_metrics: InboxHealthMetrics
