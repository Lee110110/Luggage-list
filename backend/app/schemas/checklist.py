from pydantic import BaseModel


class ChecklistItemCreate(BaseModel):
    category: str
    name: str
    quantity: int = 1
    priority: str = "选带"


class ChecklistItemUpdate(BaseModel):
    checked: bool | None = None
    quantity: int | None = None
    name: str | None = None


class ChecklistItemResponse(BaseModel):
    id: int
    trip_id: int
    category: str
    name: str
    quantity: int
    priority: str
    reason: str | None
    checked: bool
    is_custom: bool

    model_config = {"from_attributes": True}


class ProgressResponse(BaseModel):
    total: int
    checked: int
    percentage: float
    by_category: dict[str, dict[str, int]]
