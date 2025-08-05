from Helper.ModelManager import llmManager
import os
from dotenv import load_dotenv
import json

load_dotenv()
llm_path = os.getenv("LLM_MODEL_PATH")

if __name__ == "__main__":
    try:
        manifest_dict = {} 

        for root, _, files in os.walk(llm_path):
            for f in files:
                if f.endswith(".json"):
                    bp = os.path.join(root, f)
                    with open(bp, 'r') as jf:
                        jdata = json.load(jf)
                        # Convert list of {"file_name", "model_name"} to dict
                        for entry in jdata:
                            model_file = os.path.join(root, entry["model_name"])
                            manifest_dict[entry["file_name"]] = model_file
                    break  # break after first json manifest

        llm = llmManager(mod_mf=manifest_dict)
        llm.get_llm("Llama-3")
        for token in llm.stream_chat("Llama-3", "Hi your good name?"):
            print(token, end='', flush=True)
        loadm=llm.get_loaded_models()
        print("loaded_model:::",loadm)
        llm.remove_all_models()
        il=llm.is_loaded("Llama-3")
        print("is_loaded",il)
    except Exception as e:
        print(f"❌ Error occurred: {e}")
