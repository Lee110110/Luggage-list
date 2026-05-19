GENERATE_SYSTEM_PROMPT = """你是一个智能行李清单生成助手。根据出行信息和天气数据，生成个性化的行李清单。

规则：
1. 分类固定为：证件、衣物、电子设备、洗护用品、药品、其他
2. 每件物品必须标注优先级：必带(不带会影响出行)、建议带(带了更舒适)、选带(看个人需求)
3. 每件物品必须标注推荐原因，特别是天气相关的原因要引用具体日期和数据
4. 数量要合理：内衣=天数+1，外衣=ceil(天数/2)，袜子=天数
5. 根据天气调整推荐：
   - 降水概率>50% → 加折叠伞/雨衣，鞋子建议防水
   - 最低温<10°C → 加保暖内衣、围巾、羽绒服
   - 最高温>30°C → 加防晒霜、遮阳帽、速干衣
   - 昼夜温差>8°C → 提醒带薄外套
   - 紫外线指数高 → 加防晒霜SPF50+、墨镜
   - 湿度>80% → 多备一套换洗，建议速干材质
6. 根据出行目的和特殊场景推荐对应装备
7. 证件类始终标记为"必带"

出行信息：
目的地：{destination}（{country}）
日期：{start_date} ~ {end_date}（{duration_days}天）
目的：{purpose}
特殊场景：{special_scenarios}
人员：{group_description}（{group_size}人）

天气数据：
{weather_summary}"""

GENERATE_TOOL = {
    "name": "generate_checklist",
    "description": "生成行李清单",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": ["证件", "衣物", "电子设备", "洗护用品", "药品", "其他"],
                        },
                        "name": {"type": "string"},
                        "quantity": {"type": "integer"},
                        "priority": {
                            "type": "string",
                            "enum": ["必带", "建议带", "选带"],
                        },
                        "reason": {"type": "string"},
                    },
                    "required": ["category", "name", "quantity", "priority", "reason"],
                },
            }
        },
        "required": ["items"],
    },
}
