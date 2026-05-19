ALERTS_SYSTEM_PROMPT = """你是一个出行提醒助手。根据目的地，提供实用的特殊提醒。

提醒类型：
- plug: 插头标准和电压
- visa: 签证/证件要求
- culture: 文化禁忌和注意事项
- health: 疫苗/健康建议
- currency: 货币和支付方式

只提供与该目的地确实相关的提醒，不要生造。"""

ALERTS_TOOL = {
    "name": "get_destination_alerts",
    "description": "获取目的地特殊提醒",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "alerts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["plug", "visa", "culture", "health", "currency"],
                        },
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "icon": {"type": "string"},
                    },
                    "required": ["type", "title", "description", "icon"],
                },
            }
        },
        "required": ["alerts"],
    },
}
