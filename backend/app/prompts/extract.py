EXTRACT_SYSTEM_PROMPT = """你是一个出行信息提取助手。用户会用自然语言描述出行计划，你需要从中提取结构化信息。

规则：
- 如果用户说"下周五"等相对日期，基于当前日期计算绝对日期
- 如果用户没有明确说返程日期，根据出行天数推算
- 出行目的归类为：商务出差、休闲旅行、探亲、其他
- 特殊场景提取所有提到的特殊活动或需求
- 人员构成：提取人数和关系描述

当前日期：{current_date}"""

EXTRACT_TOOL = {
    "name": "extract_trip_info",
    "description": "从用户的出行描述中提取结构化出行信息",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "destination": {"type": "string", "description": "目的地城市名"},
            "destination_country": {"type": "string", "description": "目的地国家"},
            "start_date": {"type": "string", "description": "出发日期，YYYY-MM-DD格式"},
            "end_date": {"type": "string", "description": "返程日期，YYYY-MM-DD格式"},
            "duration_days": {"type": "integer", "description": "出行天数"},
            "purpose": {
                "type": "string",
                "enum": ["商务出差", "休闲旅行", "探亲", "其他"],
            },
            "special_scenarios": {
                "type": "array",
                "items": {"type": "string"},
                "description": "特殊场景列表，如正式晚宴、户外活动等",
            },
            "group_size": {"type": "integer", "description": "出行人数"},
            "group_description": {
                "type": "string",
                "description": "人员构成描述，如1人、带老婆孩子",
            },
        },
        "required": [
            "destination",
            "destination_country",
            "start_date",
            "end_date",
            "duration_days",
            "purpose",
            "special_scenarios",
            "group_size",
            "group_description",
        ],
    },
}
