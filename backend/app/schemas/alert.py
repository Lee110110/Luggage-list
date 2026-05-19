from pydantic import BaseModel


class DestinationAlert(BaseModel):
    type: str  # plug | culture | visa | health | currency
    title: str
    description: str
    icon: str
