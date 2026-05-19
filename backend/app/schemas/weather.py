from pydantic import BaseModel


class DailyForecast(BaseModel):
    date: str
    text_day: str
    temp_min: int
    temp_max: int
    humidity: int
    precip: float
    uv_index: int
    wind_scale_day: str


class WeatherResponse(BaseModel):
    daily: list[DailyForecast]
    summary: str
