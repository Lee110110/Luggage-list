import json
from datetime import date

from openai import AsyncOpenAI

from ..config import settings
from ..prompts.extract import EXTRACT_SYSTEM_PROMPT, EXTRACT_TOOL
from ..prompts.generate import GENERATE_SYSTEM_PROMPT, GENERATE_TOOL
from ..prompts.alerts import ALERTS_SYSTEM_PROMPT, ALERTS_TOOL

client = AsyncOpenAI(
    api_key=settings.AI_API_KEY,
    base_url=settings.AI_BASE_URL,
)


def _parse_arguments(args: str) -> dict:
    """Parse function call arguments, handling GLM's '{}{...}' prefix quirk."""
    args = args.strip()
    # GLM may prepend '{}' before the actual JSON object
    if args.startswith("{}"):
        args = args[2:]
    return json.loads(args)


def _convert_tool(tool_def: dict) -> dict:
    """Convert internal tool def to OpenAI function calling format."""
    return {
        "type": "function",
        "function": {
            "name": tool_def["name"],
            "description": tool_def["description"],
            "parameters": tool_def["input_schema"],
        },
    }


async def extract_trip_info(user_input: str) -> dict:
    response = await client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {
                "role": "system",
                "content": EXTRACT_SYSTEM_PROMPT.format(
                    current_date=date.today().isoformat()
                ),
            },
            {"role": "user", "content": user_input},
        ],
        tools=[_convert_tool(EXTRACT_TOOL)],
        tool_choice={"type": "function", "function": {"name": "extract_trip_info"}},
    )
    func_call = response.choices[0].message.tool_calls[0]
    return _parse_arguments(func_call.function.arguments)


async def generate_checklist(trip: dict, weather_summary: str) -> list[dict]:
    special_scenarios = trip.get("special_scenarios", [])
    scenarios_text = "、".join(special_scenarios) if special_scenarios else "无"

    response = await client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {
                "role": "system",
                "content": GENERATE_SYSTEM_PROMPT.format(
                    destination=trip["destination"],
                    country=trip.get("country", trip.get("destination_country", "")),
                    start_date=trip["start_date"],
                    end_date=trip["end_date"],
                    duration_days=trip["duration_days"],
                    purpose=trip["purpose"],
                    special_scenarios=scenarios_text,
                    group_description=trip.get(
                        "group_description", f"{trip.get('group_size', 1)}人"
                    ),
                    group_size=trip.get("group_size", 1),
                    weather_summary=weather_summary,
                ),
            },
            {"role": "user", "content": "请生成行李清单"},
        ],
        tools=[_convert_tool(GENERATE_TOOL)],
        tool_choice={"type": "function", "function": {"name": "generate_checklist"}},
    )
    func_call = response.choices[0].message.tool_calls[0]
    return _parse_arguments(func_call.function.arguments)["items"]


async def get_destination_alerts(destination: str, country: str) -> list[dict]:
    response = await client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {"role": "system", "content": ALERTS_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"我去{country}{destination}，需要了解当地特殊提醒",
            },
        ],
        tools=[_convert_tool(ALERTS_TOOL)],
        tool_choice={
            "type": "function",
            "function": {"name": "get_destination_alerts"},
        },
    )
    func_call = response.choices[0].message.tool_calls[0]
    return _parse_arguments(func_call.function.arguments)["alerts"]
