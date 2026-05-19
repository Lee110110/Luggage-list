from fastapi import APIRouter

from ..schemas.weather import DailyForecast, WeatherResponse
from ..services import weather_service

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("/forecast", response_model=WeatherResponse)
async def get_weather_forecast(city: str, start: str, end: str):
    daily, summary = await weather_service.get_forecast(city, start, end)
    return WeatherResponse(
        daily=[DailyForecast(**d) for d in daily],
        summary=summary,
    )
