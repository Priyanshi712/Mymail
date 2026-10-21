from typing import Dict, Any, List
from app.models.dashboard import (
    InboxHealthMetrics,
    PriorityThreadItem,
    RecentActivityItem,
    DashboardOverviewResponse,
    TriageActionResponse,
)


class DashboardService:
    def __init__(self):
        # In-memory storage for priority threads per user
        self._threads_store: Dict[str, List[Dict[str, Any]]] = {}
        self._activity_store: Dict[str, List[Dict[str, Any]]] = {}

    def _get_initial_threads(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "t1",
                "sender_name": "Sarah Chen",
                "sender_email": "sarah.chen@acme.corp",
                "subject": "Q4 Cloud Infrastructure Budget Sign-off Needed",
                "snippet": "Can you confirm if we have green light for the additional compute clusters before 4 PM today?",
                "urgency": "Urgent",
                "deadline": "Due today 4:00 PM",
                "time_ago": "15m ago",
                "category": "Budget",
                "resolved": False,
            },
            {
                "id": "t2",
                "sender_name": "Marcus Vance",
                "sender_email": "marcus@vancecap.io",
                "subject": "Partnership Agreement — Revised Term Sheet",
                "snippet": "Please review the updated IP clauses in Section 4.3 and let us know your team's feedback.",
                "urgency": "High",
                "deadline": "Due Friday 5:00 PM",
                "time_ago": "1h ago",
                "category": "Legal",
                "resolved": False,
            },
            {
                "id": "t3",
                "sender_name": "Elena Rostova",
                "sender_email": "elena@productlab.dev",
                "subject": "API Integration Milestone Review",
                "snippet": "Drafted the endpoint specifications for the Gmail OAuth token refresh. Does this match your schema?",
                "urgency": "Medium",
                "deadline": "Within 24 hours",
                "time_ago": "3h ago",
                "category": "Engineering",
                "resolved": False,
            },
            {
                "id": "t4",
                "sender_name": "David Kross",
                "sender_email": "david@fintech-advisors.com",
                "subject": "Investor Update Draft & Board Deck Review",
                "snippet": "Please review slide 8 (MRR Growth) and verify the numbers before we circulate to partners.",
                "urgency": "High",
                "deadline": "Due tomorrow 12:00 PM",
                "time_ago": "4h ago",
                "category": "Investors",
                "resolved": False,
            },
        ]

    def _get_initial_activities(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "act-1",
                "action": "AI Summary Generated",
                "description": "Distilled 8 messages on 'Q4 Cloud Infrastructure Scaling'.",
                "timestamp": "20m ago",
                "type": "summary",
            },
            {
                "id": "act-2",
                "action": "Urgent Thread Flagged",
                "description": "Sarah Chen requested compute sign-off before 4 PM.",
                "timestamp": "1h ago",
                "type": "reply",
            },
            {
                "id": "act-3",
                "action": "Mailbox Synced",
                "description": "Gmail API synchronization completed cleanly.",
                "timestamp": "2h ago",
                "type": "sync",
            },
            {
                "id": "act-4",
                "action": "Follow-up Reminder Set",
                "description": "Scheduled reminder for Alex Rivera on Friday 10:00 AM.",
                "timestamp": "3h ago",
                "type": "reminder",
            },
        ]

    def get_overview(self, user_id: str) -> DashboardOverviewResponse:
        if user_id not in self._threads_store:
            self._threads_store[user_id] = self._get_initial_threads()
        if user_id not in self._activity_store:
            self._activity_store[user_id] = self._get_initial_activities()

        threads = self._threads_store[user_id]
        active_urgent = [t for t in threads if not t["resolved"]]

        # Metrics calculation
        total_unread = 8 + len(active_urgent)
        needs_reply_count = len(active_urgent)
        ai_summaries_count = 8
        followups_due_today = 3
        # Calculate progress towards triage
        total_items = len(threads)
        resolved_count = total_items - needs_reply_count
        inbox_zero_pct = round((resolved_count / total_items) * 100, 1) if total_items > 0 else 100.0

        metrics = InboxHealthMetrics(
            total_unread=total_unread,
            needs_reply_count=needs_reply_count,
            ai_summaries_count=ai_summaries_count,
            followups_due_today=followups_due_today,
            inbox_zero_percentage=inbox_zero_pct,
            avg_response_time_hours=1.8,
            safe_send_active=True,
        )

        priority_queue = [PriorityThreadItem(**t) for t in threads]
        recent_activity = [RecentActivityItem(**a) for a in self._activity_store[user_id]]

        return DashboardOverviewResponse(
            metrics=metrics,
            priority_queue=priority_queue,
            recent_activity=recent_activity,
        )

    def triage_thread(self, user_id: str, thread_id: str, action: str) -> TriageActionResponse:
        if user_id not in self._threads_store:
            self._threads_store[user_id] = self._get_initial_threads()

        threads = self._threads_store[user_id]
        target = None
        for t in threads:
            if t["id"] == thread_id:
                target = t
                break

        if not target:
            raise ValueError(f"Thread '{thread_id}' not found")

        if action == "resolve":
            target["resolved"] = True
            msg = f"Thread '{target['subject']}' marked as resolved"
        elif action == "snooze":
            target["resolved"] = True
            target["deadline"] = "Snoozed 2 days"
            msg = f"Thread '{target['subject']}' snoozed"
        elif action == "drafted":
            msg = f"AI draft reply initialized for '{target['subject']}'"
        else:
            msg = "Action completed"

        overview = self.get_overview(user_id)
        return TriageActionResponse(
            success=True,
            thread_id=thread_id,
            message=msg,
            updated_metrics=overview.metrics,
        )


dashboard_service = DashboardService()
