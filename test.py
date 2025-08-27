from Helper.ModelManager import llmManager
import os
from dotenv import load_dotenv
import json

def load_manifest(llm_path: str) -> dict:
    """
    Load the first .json manifest found under llm_path and 
    convert it into a usable dict for llmManager.
    """
    manifest_dict = {}
    for root, _, files in os.walk(llm_path):
        for f in files:
            if f.endswith(".json"):
                manifest_path = os.path.join(root, f)
                with open(manifest_path, "r") as jf:
                    jdata = json.load(jf)

                # Convert [{"file_name":..., "model_name":...}] → {file_name: full_path}
                for entry in jdata:
                    model_file = os.path.join(root, entry["model_name"])
                    manifest_dict[entry["file_name"]] = model_file

                print(f"✅ Manifest loaded from: {manifest_path}")
                return manifest_dict  # stop after first .json

    raise FileNotFoundError(f"❌ No .json manifest found in {llm_path}")


if __name__ == "__main__":
    load_dotenv()
    llm_path = os.getenv("LLM_MODEL_PATH")

    if not llm_path:
        raise ValueError("❌ LLM_MODEL_PATH missing in .env file")

    try:
        # Step 1: Load manifest
        manifest_dict = load_manifest(llm_path)

        # Step 2: Init manager
        llm = llmManager(mod_mf=manifest_dict)

        # Pick "Llama-3" if available, else fallback
        model_name = "deepseek-coder-6.7b" if "deepseek-coder-6.7b" in manifest_dict else next(iter(manifest_dict))

        # Step 3: Load model
        llm.get_llm(model_name)
        print(f"✅ Loaded model: {model_name}")

        while True:
            inp = input("Enter Prompt: ")
            if inp.upper() == "EXIT":
                break   # <-- FIXED: use break, not return

            # Step 4: Run streaming chat
            print("🗨️ Streaming response:")
            for token in llm.chat(model_name, inp,max_tokens=512,temperature=0.1):
                print(token, end="", flush=True)
            print("\n")

            # Step 5: Show loaded models
            print("📌 Loaded models:", llm.get_loaded_models())

        # Step 6: Remove all models
        print(llm.remove_all_models())

        # Step 7: Verify unload
        print(f"✅ Is {model_name} still loaded?", llm.is_loaded(model_name))

    except Exception as e:
        print(f"❌ Error occurred: {e}")
