from enum import Enum
from pydantic import BaseModel
from typing import List, Dict
from Models.gpt_mod import OpenAIModel

class RoleEnum(str, Enum):
    system = "system"
    user = "user"
    assistant = "assistant"
    tool = "tool"

class Step(BaseModel):
    role: RoleEnum
    prompt: str

class ChainRequest(BaseModel):
    model: OpenAIModel
    system: Step
    chain: List[Dict[str, Step]]

class Prompt_Input(BaseModel):
    prompt:str
    
class LocMod(BaseModel):
    loc_mod:str