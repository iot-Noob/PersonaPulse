from enum import Enum

class OpenAIModel(str, Enum):
    llama3_8b = "llama3-8b-8192"
    llama3_70b = "llama3-70b-8192"
    gemma_7b = "gemma-7b-it"
    mixtral_8x7b = "mixtral-8x7b-32768"
