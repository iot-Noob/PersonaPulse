from enum import Enum
from typing import Optional
from pydantic import BaseModel
class OpenAIModel(str, Enum):
    llama3_8b = "llama3-8b-8192"
    llama3_70b = "llama3-70b-8192"
    ds_r1= "deepseek-r1-distill-llama-70b"
    google_gama="gemma2-9b-it"
    lama4="meta-llama/llama-4-scout-17b-16e-instruct"

class LocalModel(str, Enum):
    llama3 = "Llama-3"
    mistral = "mistral-7b"

class ModelSelection(BaseModel):
    local_model: Optional[LocalModel] = None