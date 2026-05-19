from datetime import date, timedelta

import httpx

from ..config import settings


async def lookup_city(city_name: str) -> str | None:
    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(
            f"{settings.QWEATHER_BASE_URL}/geo/v2/city/lookup",
            params={"location": city_name, "key": settings.QWEATHER_API_KEY},
        )
        data = resp.json()
        if data.get("code") == "200" and data.get("location"):
            return data["location"][0]["id"]
    return None


async def get_forecast(
    city_name: str, start_date: str, end_date: str
) -> tuple[list[dict], str]:
    location_id = await lookup_city(city_name)
    if not location_id:
        return [], f"未找到{city_name}的天气数据"

    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(
            f"{settings.QWEATHER_BASE_URL}/v7/weather/7d",
            params={"location": location_id, "key": settings.QWEATHER_API_KEY},
        )
        data = resp.json()

    if data.get("code") != "200":
        return [], f"获取{city_name}天气数据失败"

    daily_raw = data.get("daily", [])
    daily = []
    for d in daily_raw:
        daily.append({
            "date": d["fxDate"],
            "text_day": d["textDay"],
            "temp_min": int(d["tempMin"]),
            "temp_max": int(d["tempMax"]),
            "humidity": int(d["humidity"]),
            "precip": float(d["precip"]),
            "uv_index": int(d.get("uvIndex", 0)),
            "wind_scale_day": d["windScaleDay"],
        })

    start = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)
    filtered = [d for d in daily if start <= date.fromisoformat(d["date"]) <= end]

    summary = _build_summary(filtered)
    return filtered, summary


def _build_summary(daily: list[dict]) -> str:
    if not daily:
        return "暂无天气数据"

    temps = [d["temp_min"] for d in daily] + [d["temp_max"] for d in daily]
    avg_temp = sum(temps) // len(temps)
    rain_days = sum(1 for d in daily if "雨" in d["text_day"])
    temp_range = max(temps) - min(temps)

    parts = [f"平均气温{avg_temp}°C"]
    if rain_days:
        parts.append(f"有{rain_days}日可能降雨")
    if temp_range > 8:
        parts.append(f"昼夜温差约{temp_range}°C")

    return "，".join(parts)
