from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin, get_current_user
from app.db.database import get_db
from app.models.geofence import Geofence
from app.models.geofence_rule import GeofenceRule
from app.models.user import User
from app.schemas.geofence_rule import (
    GeofenceRuleCreate,
    GeofenceRuleResponse,
    GeofenceRuleUpdate,
)

router = APIRouter(
    prefix="/geofences",
    tags=["Geofence Rules"],
)


@router.post(
    "/{geofence_id}/rules",
    response_model=GeofenceRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_geofence_rule(
    geofence_id: int,
    rule_data: GeofenceRuleCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    geofence = (
        db.query(Geofence)
        .filter(Geofence.id == geofence_id)
        .first()
    )

    if not geofence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence not found",
        )

    existing_rule = (
        db.query(GeofenceRule)
        .filter(
            GeofenceRule.geofence_id == geofence_id,
            GeofenceRule.event_type == rule_data.event_type,
        )
        .first()
    )

    if existing_rule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event rule already exists for the geofence",
        )

    new_rule = GeofenceRule(
        geofence_id=geofence_id,
        event_type=rule_data.event_type,
        is_enabled=rule_data.is_enabled,
    )

    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)

    return new_rule


@router.get(
    "/{geofence_id}/rules",
    response_model=list[GeofenceRuleResponse],
)
def get_geofence_rules(
    geofence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    geofence = (
        db.query(Geofence)
        .filter(Geofence.id == geofence_id)
        .first()
    )

    if not geofence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence not found",
        )

    rules = (
        db.query(GeofenceRule)
        .filter(GeofenceRule.geofence_id == geofence_id)
        .order_by(GeofenceRule.id)
        .all()
    )

    return rules


@router.put(
    "/{geofence_id}/rules/{rule_id}",
    response_model=GeofenceRuleResponse,
)
def update_geofence_rule(
    geofence_id: int,
    rule_id: int,
    rule_data: GeofenceRuleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    rule = (
        db.query(GeofenceRule)
        .filter(
            GeofenceRule.id == rule_id,
            GeofenceRule.geofence_id == geofence_id,
        )
        .first()
    )

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence rule not found",
        )

    rule.is_enabled = rule_data.is_enabled

    db.commit()
    db.refresh(rule)

    return rule


@router.delete(
    "/{geofence_id}/rules/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_geofence_rule(
    geofence_id: int,
    rule_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    rule = (
        db.query(GeofenceRule)
        .filter(
            GeofenceRule.id == rule_id,
            GeofenceRule.geofence_id == geofence_id,
        )
        .first()
    )

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence rule not found",
        )

    db.delete(rule)
    db.commit()

    return None