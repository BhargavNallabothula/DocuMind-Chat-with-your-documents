from pydantic import BaseModel

class chatRequest(BaseModel):
    user_message:str