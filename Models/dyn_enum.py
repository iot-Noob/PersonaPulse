from enum import Enum
import os, json

def get_character_enum():
    manifest_path = os.path.join(os.path.dirname(__file__), "../Roles/manifest.json")

    if not os.path.exists(manifest_path):
        raise FileNotFoundError("manifest.json not found")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    enum_dict = {}
    for v in manifest.values():
        for item in v:
            subname = item.get("subname")
            file = item.get("file")
            key = subname.replace(" ", "_").replace("-", "_").replace(".", "_")
            enum_dict[key] = subname  # or file if needed

    return Enum("Character", enum_dict)
