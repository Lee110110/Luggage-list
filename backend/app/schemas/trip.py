from datetime import date

from pydantic import BaseModel


class ExtractRequest(BaseModel):
    input: str


class ExtractedTrip(BaseModel):
    destination: str
    destination_country: str
    start_date: str
    end_date: str
    duration_days: int
    purpose: str
    special_scenarios: list[str] = []
    group_size: int = 1
    group_description: str = "1人"


class CreateTripRequest(BaseModel):
    user_input: str
    destination: str
    country: str | None = None
    start_date: str
    end_date: str
    duration_days: int
    purpose: str
    special_scenarios: list[str] = []
    group_size: int = 1
    group_description: str = "1人"


class TripResponse(BaseModel):
    id: int
    user_input: str
    destination: str
    country: str | None
    start_date: str
    end_date: str
    duration_days: int
    purpose: str
    special_scenarios: list[str]
    group_size: int
    group_description: str | None
    status: str

    model_config = {"from_attributes": True}
