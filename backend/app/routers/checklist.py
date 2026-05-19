from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.checklist import (
    ChecklistItemCreate,
    ChecklistItemUpdate,
    ChecklistItemResponse,
    ProgressResponse,
)
from ..services import checklist_service

router = APIRouter(prefix="/api/checklists", tags=["checklists"])


@router.get("/trips/{trip_id}/items")
async def get_checklist(trip_id: int, db: Session = Depends(get_db)):
    items = checklist_service.get_checklist(db, trip_id)
    progress = checklist_service.get_progress(db, trip_id)
    return {
        "items": [
            ChecklistItemResponse(
                id=i.id,
                trip_id=i.trip_id,
                category=i.category,
                name=i.name,
                quantity=i.quantity,
                priority=i.priority,
                reason=i.reason,
                checked=bool(i.checked),
                is_custom=bool(i.is_custom),
            )
            for i in items
        ],
        "progress": progress,
    }


@router.patch("/items/{item_id}", response_model=ChecklistItemResponse)
async def update_checklist_item(item_id: int, updates: ChecklistItemUpdate, db: Session = Depends(get_db)):
    update_data = updates.model_dump(exclude_none=True)
    item = checklist_service.update_item(db, item_id, update_data)
    if not item:
        raise HTTPException(status_code=404, detail="物品不存在")
    return ChecklistItemResponse(
        id=item.id,
        trip_id=item.trip_id,
        category=item.category,
        name=item.name,
        quantity=item.quantity,
        priority=item.priority,
        reason=item.reason,
        checked=bool(item.checked),
        is_custom=bool(item.is_custom),
    )


@router.post("/trips/{trip_id}/items", response_model=ChecklistItemResponse)
async def add_custom_item(trip_id: int, item_data: ChecklistItemCreate, db: Session = Depends(get_db)):
    item = checklist_service.add_custom_item(db, trip_id, item_data.model_dump())
    return ChecklistItemResponse(
        id=item.id,
        trip_id=item.trip_id,
        category=item.category,
        name=item.name,
        quantity=item.quantity,
        priority=item.priority,
        reason=item.reason,
        checked=bool(item.checked),
        is_custom=bool(item.is_custom),
    )


@router.delete("/items/{item_id}")
async def delete_checklist_item(item_id: int, db: Session = Depends(get_db)):
    if not checklist_service.delete_item(db, item_id):
        raise HTTPException(status_code=404, detail="物品不存在")
    return {"detail": "已删除"}


@router.get("/trips/{trip_id}/progress", response_model=ProgressResponse)
async def get_progress(trip_id: int, db: Session = Depends(get_db)):
    return checklist_service.get_progress(db, trip_id)
