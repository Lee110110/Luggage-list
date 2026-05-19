import asyncio
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.trip import Trip
from ..schemas.trip import ExtractRequest, ExtractedTrip, CreateTripRequest, TripResponse
from ..schemas.checklist import ChecklistItemResponse
from ..schemas.weather import DailyForecast, WeatherResponse
from ..schemas.alert import DestinationAlert
from ..services import ai_service, weather_service, checklist_service

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("/extract", response_model=ExtractedTrip)
async def extract_trip(req: ExtractRequest):
    try:
        result = await ai_service.extract_trip_info(req.input)
        return ExtractedTrip(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 提取失败: {str(e)}")


@router.post("")
async def create_trip(req: CreateTripRequest, db: Session = Depends(get_db)):
    # Save trip
    trip = Trip(
        user_input=req.user_input,
        destination=req.destination,
        country=req.country,
        start_date=req.start_date,
        end_date=req.end_date,
        duration_days=req.duration_days,
        purpose=req.purpose,
        special_scenarios=json.dumps(req.special_scenarios, ensure_ascii=False),
        group_size=req.group_size,
        group_desc=req.group_description,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    trip_data = {
        "destination": req.destination,
        "destination_country": req.country or "",
        "country": req.country or "",
        "start_date": req.start_date,
        "end_date": req.end_date,
        "duration_days": req.duration_days,
        "purpose": req.purpose,
        "special_scenarios": req.special_scenarios,
        "group_size": req.group_size,
        "group_description": req.group_description,
    }

    # Run weather, checklist, alerts in parallel
    weather_task = asyncio.create_task(_fetch_weather(req.destination, req.start_date, req.end_date))
    alerts_task = asyncio.create_task(_fetch_alerts(req.destination, req.country or ""))

    # Wait for weather first (checklist needs it), then generate checklist
    weather_daily, weather_summary = await weather_task

    checklist_items = []
    try:
        raw_items = await ai_service.generate_checklist(trip_data, weather_summary)
        checklist_items = checklist_service.create_checklist(db, trip.id, raw_items)
    except Exception:
        pass

    # Alerts should be done by now (ran in parallel with weather)
    alerts = await alerts_task

    return {
        "trip_id": trip.id,
        "trip": TripResponse(
            id=trip.id,
            user_input=trip.user_input,
            destination=trip.destination,
            country=trip.country,
            start_date=str(trip.start_date),
            end_date=str(trip.end_date),
            duration_days=trip.duration_days,
            purpose=trip.purpose,
            special_scenarios=req.special_scenarios,
            group_size=trip.group_size,
            group_description=trip.group_desc,
            status=trip.status,
        ),
        "weather": WeatherResponse(
            daily=[DailyForecast(**d) for d in weather_daily],
            summary=weather_summary,
        ),
        "checklist": [
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
            for i in checklist_items
        ],
        "alerts": alerts,
    }


async def _fetch_weather(destination: str, start_date: str, end_date: str):
    try:
        return await asyncio.wait_for(
            weather_service.get_forecast(destination, start_date, end_date),
            timeout=10,
        )
    except Exception:
        return [], "天气数据暂不可用"


async def _fetch_alerts(destination: str, country: str):
    try:
        raw_alerts = await ai_service.get_destination_alerts(destination, country)
        return [DestinationAlert(**a) for a in raw_alerts]
    except Exception:
        return []


@router.get("/{trip_id}")
async def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="行程不存在")

    items = checklist_service.get_checklist(db, trip_id)
    progress = checklist_service.get_progress(db, trip_id)

    return {
        "trip": TripResponse(
            id=trip.id,
            user_input=trip.user_input,
            destination=trip.destination,
            country=trip.country,
            start_date=str(trip.start_date),
            end_date=str(trip.end_date),
            duration_days=trip.duration_days,
            purpose=trip.purpose,
            special_scenarios=json.loads(trip.special_scenarios or "[]"),
            group_size=trip.group_size,
            group_description=trip.group_desc,
            status=trip.status,
        ),
        "checklist": [
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


@router.get("")
async def list_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).order_by(Trip.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "destination": t.destination,
            "start_date": str(t.start_date),
            "end_date": str(t.end_date),
        }
        for t in trips
    ]
