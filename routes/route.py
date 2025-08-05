from ast import mod
from re import M
from Models.gpt_mod import OpenAIModel,ModelSelection
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse,StreamingResponse
from Models.main_model import ChainRequest,RoleEnum,Prompt_Input,LocMod
from Models.dyn_enum import get_character_enum
from openai import OpenAI
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import json
from uuid import uuid4
from typing import Optional
from Helper.ModelManager import llmManager
load_dotenv()
base_dir = os.path.dirname(os.path.abspath(__file__))
roles_dir = os.path.join(base_dir, "../Roles")
manifest_path = os.path.join(roles_dir, "manifest.json")

gc=get_character_enum()
llm_manager=llmManager()
llm_mfj=[{}]
@asynccontextmanager
async def lifespan(app: APIRouter):
    print("STARTUP: Init Groq client")
    apikey = os.getenv("API_KEY")
    global llm_manager
    global client
    global mainf  
    global llm_models_dir
    global llm_mfj
    mfp=""
    mfe=False
    llm_models_dir=os.getenv("LLM_MODEL_PATH")
    if not llm_models_dir or not os.path.isdir(llm_models_dir):
        raise ValueError("Error dir path for llm model not exist")

    for root, _, files in os.walk(llm_models_dir):
        for f in files:
            if f.endswith(".json"):
                mfe = True
                mfp = os.path.join(root, f)
                break
        if mfe:
            break  # exit outer loop once found

    if not mfe:
        raise ValueError("❌ Manifest file (.json) not found in model path")
    else:
 
        cmf=llm_manager.convert_manifest_json(mfp)
        llm_manager=llmManager(mod_mf=cmf)
    if not os.path.exists(manifest_path):
        raise ValueError("Error cant load manifest file make sure poath and fiename is correct or file exist")
    with open(manifest_path, 'r', encoding='utf-8') as f:
        mainf  = json.load(f)
    if not apikey:
        raise ValueError("API key missing")
    
    client = OpenAI(
        api_key=apikey,
        base_url="https://api.groq.com/openai/v1",
        timeout=10,
        
    )

    yield
    print("SHUTDOWN: Clean up resources")
    llm_manager.remove_all_models()
    
route = APIRouter(lifespan=lifespan)


def make_echart(prompt: str, model, temperature: float):
    try:
        SYSTEM_PROMPT = """
        You are a helpful assistant focused exclusively on generating valid ECharts option objects in JSON format.
        Return ONLY the JSON object for the chart (do not wrap in code blocks or embed in markdown).
        Supported chart types: bar, line, pie, scatter, radar.
        Use realistic example data only.
        Always include tooltip for better interactivity.
        If you cannot generate a valid chart, return an empty object: {}.
        """.strip()

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]

        response = client.chat.completions.create(
            model=model.value,
            messages=messages,
            temperature=temperature,
        )

        raw = response.choices[0].message.content.strip()

        # Remove code block syntax if present
        if raw.startswith("```"):
            raw = raw.strip("`").strip()
            if raw.lower().startswith("json"):
                raw = raw[4:].strip()

        # Parse JSON
        try:
            chart_option = json.loads(raw)
            if isinstance(chart_option, dict):
                return chart_option
            else:
                return {}  # Not a valid ECharts object
        except json.JSONDecodeError:
            return {}  # Model didn't return valid JSON

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating ECharts: {e}")
    



@route.post("/echarts", tags=["echart response"])
async def get_chart(
    prmopt:Prompt_Input,
    model: OpenAIModel,
    temperature: float,
    
):
    try:
        res=make_echart(prmopt.prompt,model,temperature)
        return res
    except Exception as e:
        raise HTTPException(500, f"Error occurred in ECharts generation: {str(e)}")
    
DEFAULT_SYSTEM_PROMPT = """
You are a helpful and truthful assistant.

## 📐 Formatting Rules
- Use headings (##, ###), bullet or numbered lists.
- Use **inline code** (`...`) only for variable names, keywords, or function names in sentences.
- Use **fenced code blocks with language tags** (e.g. ```python) for *all* code snippets — even small ones (1–2 lines).
- Do NOT wrap tables or Markdown in code blocks. Use plain Markdown format.
- Preserve line breaks in poems or structured text.

## 🧠 Factuality Rules
- Provide only verified, factual information.
- If unsure or unverified, respond: “I’m not certain” or “I don’t know.”
- Do NOT invent functions, APIs, or data.
- Do not assume undocumented APIs or features exist — if unsure, say so.
- When referencing facts or APIs, cite credible sources clearly (e.g., “According to the OpenAI docs…”)

## 🛠️ Reasoning & Verification
- Use Chain-of-Thought: “Let’s think step-by-step.”
- Then use Chain-of-Verification: re-check each fact before finalizing.
- If output includes code, suggest a test or validation step.
- Optionally include a few-shot example where the correct answer is “I don’t know.”

## 📡 (Optional) RAG
- If external data is available, retrieve and cite it.
- If no source is found, say “I couldn’t verify that.”

Your final response must strictly follow all the above rules.
""".strip()


@route.post(path="/simple_prompt", tags=["Simple_prompt"])
async def simple_prompt(
    cms: ModelSelection,
    role: RoleEnum,
    model: OpenAIModel,
    prompt: Prompt_Input,
    temperature: float = 0.3,
    character: Optional[gc] = None,
    use_local: bool = False,
):
    try:
        if not (0.0 <= temperature <= 1.0):
            raise HTTPException(status_code=400, detail="Temperature must be between 0.0 and 1.0")

        system_msg = {"role": "system", "content": DEFAULT_SYSTEM_PROMPT}
        user_msg = {"role": role.value, "content": prompt.prompt}

        if role.value == "tool":
            tool_id = str(uuid4())
            system_msg["tool_call_id"] = tool_id
            user_msg["tool_call_id"] = tool_id

        # ✅ Use local model
        if use_local:
            try:
                model_name = cms.local_model
                if not llm_manager.is_loaded(model_name):
                    raise HTTPException(404, detail="Requested model is not loaded in local cache")

                if character is None:
                    result = llm_manager.chat(
                        model_name=model_name,
                        prompt=prompt.prompt,
                        temperature=temperature,
                        max_tokens=256
                    )
                else:
                    persona_prompt = None
                    for k, v in mainf.items():
                        for va in v:
                            if va["subname"] == character.value:
                                bpa = os.path.join(roles_dir, va["file"])
                                if not os.path.exists(bpa):
                                    raise HTTPException(404, "Persona file not found")

                                with open(bpa, 'r', encoding='utf-8') as f:
                                    persona = json.load(f)

                                persona_prompt = persona["content"] if isinstance(persona, dict) else persona

                    if not persona_prompt:
                        raise HTTPException(404, detail="Persona not found")

                    # You can modify this if your LLM expects full message chain instead
                    combined_prompt = f"{persona_prompt.strip()}\n\n{prompt.prompt.strip()}"
                    result = llm_manager.chat(
                        model_name=model_name,
                        prompt=combined_prompt,
                        temperature=temperature,
                        max_tokens=256
                    )

                return {
                    "response": result,
                    "model": model_name,
                    "role": role.value
                }

            except Exception as e:
                raise HTTPException(500, detail=f"Error getting response from local model: {e}")

        # ✅ Use cloud (OpenAI/Groq)
        msg_chain = []

        if character is None:
            msg_chain = [system_msg, user_msg]
        else:
            persona_found = False
            for k, v in mainf.items():
                for va in v:
                    if va["subname"] == character.value:
                        bpa = os.path.join(roles_dir, va["file"])
                        if not os.path.exists(bpa):
                            raise HTTPException(404, "Persona file not found")

                        with open(bpa, 'r', encoding='utf-8') as f:
                            persona = json.load(f)

                        msg_chain = [persona, user_msg]
                        persona_found = True
                        break
                if persona_found:
                    break

            if not persona_found:
                raise HTTPException(404, detail="Persona character not found")

        res = client.chat.completions.create(
            model=model.value,
            messages=msg_chain,
            temperature=temperature
        )

        if not res:
            raise HTTPException(status_code=500, detail="No response from cloud LLM")

        return {
            "response": res.choices[0].message.content,
            "model": model.value,
            "role": role.value
        }

    except Exception as e:
        raise HTTPException(status_code=433, detail=f"Error getting response due to: {e}")

@route.post("/chain_response", description="Get API response from Groq for chained prompts", tags=["Chain Response"])
async def chain_res(creq: ChainRequest, temperature: float = 0.3, character: Optional[str] = None):
    try:
        if not (0.0 <= temperature <= 0.8):
            raise HTTPException(status_code=400, detail="Temperature must be between 0.0 and 0.8")

        messages = []

        # Step 1: Load persona if character is provided
        if character:
            found = False
            for k, v in mainf.items():
                for val in v:
                    if val["subname"] == character:
                        bp = os.path.join(roles_dir, val["file"])
                        if os.path.exists(bp):
                            with open(bp, 'r', encoding='utf-8') as f:
                                persona = json.load(f)
                            messages.append(persona)
                            found = True
            if not found:
                raise HTTPException(status_code=404, detail="Character not found in manifest")

        # Step 2: Add system message
        messages.append({"role":"system","content":DEFAULT_SYSTEM_PROMPT})
        messages.append({
            "role": creq.system.role,
            "content": creq.system.prompt
        })

        # Step 3: Append chain steps (always!)
        for step in creq.chain:
            for _, step_content in step.items():
                messages.append({
                    "role": step_content.role,
                    "content": step_content.prompt
                })

        print("Formatted Messages:", json.dumps(messages, indent=2))

        # Step 4: Send request
        res = client.chat.completions.create(
            model=creq.model.value,
            messages=messages,
            temperature=temperature
        )

        return {
            "response": res.choices[0].message.content,
            "model": creq.model
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error getting response due to {str(e)}"}
        )

@route.get(path="/get_model", tags=["get_ai_model_data"])
async def get_model():
    return {"models": [model.value for model in OpenAIModel]}

@route.get(path="/get_role", tags=["get_ai_model_data"])
async def get_role():
    return {"Roles": [model.value for model in RoleEnum]}

@route.get(path="/characters", tags=["get_ai_model_data"])
async def get_character():


    if not os.path.exists(manifest_path):
        raise HTTPException(status_code=404, detail="Manifest.json not found")


    result = []

    for v in mainf.values():
        for item in v:
            file = item.get("file")
            subname = item.get("subname")
            file_path = os.path.join(roles_dir, file)

            if os.path.exists(file_path):
                result.append(subname)

    return {"characters": result}

@route.post("/load_model", tags=["load-local-model"])
async def load_local_model(mod_name: LocMod):
    try:

        if not llm_manager.is_loaded(mod_name.loc_mod):
        
            llm_manager.get_llm(model_name=mod_name.loc_mod)
            return {"status": "✅ Model loaded", "model_path":mod_name.loc_mod}
        else:
            return JSONResponse("Model loaded already",200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Error loading model: {str(e)}")
    
@route.get("/get_aim", tags=["get_ai_model_data"])
async def get_ai_mod():
    glm = llm_manager.get_loaded_models()  # returns list of loaded models
    loaded_names = {item["model_name"] for item in glm}  # for quick lookup

    ffr = []
    for model_name, file_path in llm_manager.mod_mainifest_file.items():
        ffr.append({
            "model_name": model_name,
            "activated": model_name in loaded_names
        })

    return ffr