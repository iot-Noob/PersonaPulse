from enum import Enum

class OpenAIModel(str, Enum):
    llama3_8b = "llama3-8b-8192"
    llama3_70b = "llama3-70b-8192"
    gemma_7b = "gemma-7b-it"
    mixtral_8x7b = "mixtral-8x7b-32768"
    ds_r1= "deepseek-r1-distill-llama-70b"
    google_gama="gemma2-9b-it"
    meta_guard="meta-llama/llama-prompt-guard-2-86m"
    lama4="meta-llama/llama-4-scout-17b-16e-instruct"
    mistrial_saba24b="mistral-saba-24b"