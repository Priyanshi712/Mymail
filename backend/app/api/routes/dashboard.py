from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth import UserResponse
from app.models.dashboard import (
    DashboardOverviewResponse,
    TriageActionRequest,
    TriageActionResponse,
)
from app.api.deps import get_current_user
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Retrieves real-time inbox health metrics, triage progress percentage,
    urgent needs-reply attention queue, and recent AI activity.
    """
    return dashboard_service.get_overview(current_user.id)


@router.post("/triage/{thread_id}", response_model=TriageActionResponse)
def triage_thread_action(
    thread_id: str,
    action_in: TriageActionRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Executes a triage action (resolve, snooze, drafted) on a priority thread,
    dynamically recalculating inbox health metrics and Inbox Zero progress.
    """
    try:
        return dashboard_service.triage_thread(
            user_id=current_user.id,
            thread_id=thread_id,
            action=action_in.action
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
