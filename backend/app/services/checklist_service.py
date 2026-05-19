from sqlalchemy.orm import Session

from ..models.trip import Trip, ChecklistItem


def create_checklist(db: Session, trip_id: int, items: list[dict]) -> list[ChecklistItem]:
    db_items = []
    for i, item in enumerate(items):
        db_item = ChecklistItem(
            trip_id=trip_id,
            category=item["category"],
            name=item["name"],
            quantity=item.get("quantity", 1),
            priority=item.get("priority", "建议带"),
            reason=item.get("reason"),
            checked=0,
            is_custom=0,
            sort_order=i,
        )
        db.add(db_item)
        db_items.append(db_item)
    db.commit()
    for item in db_items:
        db.refresh(item)
    return db_items


def get_checklist(db: Session, trip_id: int) -> list[ChecklistItem]:
    return (
        db.query(ChecklistItem)
        .filter(ChecklistItem.trip_id == trip_id)
        .order_by(ChecklistItem.sort_order)
        .all()
    )


def get_item(db: Session, item_id: int) -> ChecklistItem | None:
    return db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()


def update_item(db: Session, item_id: int, updates: dict) -> ChecklistItem | None:
    item = get_item(db, item_id)
    if not item:
        return None
    for key, value in updates.items():
        if value is not None:
            if key == "checked":
                setattr(item, key, 1 if value else 0)
            else:
                setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


def add_custom_item(db: Session, trip_id: int, item_data: dict) -> ChecklistItem:
    max_order = (
        db.query(ChecklistItem)
        .filter(ChecklistItem.trip_id == trip_id)
        .count()
    )
    item = ChecklistItem(
        trip_id=trip_id,
        category=item_data["category"],
        name=item_data["name"],
        quantity=item_data.get("quantity", 1),
        priority=item_data.get("priority", "选带"),
        reason="用户自定义",
        checked=0,
        is_custom=1,
        sort_order=max_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int) -> bool:
    item = get_item(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def get_progress(db: Session, trip_id: int) -> dict:
    items = get_checklist(db, trip_id)
    total = len(items)
    checked = sum(1 for i in items if i.checked)
    percentage = round(checked / total * 100) if total > 0 else 0

    by_category = {}
    for item in items:
        cat = item.category
        if cat not in by_category:
            by_category[cat] = {"total": 0, "checked": 0}
        by_category[cat]["total"] += 1
        if item.checked:
            by_category[cat]["checked"] += 1

    return {
        "total": total,
        "checked": checked,
        "percentage": percentage,
        "by_category": by_category,
    }
