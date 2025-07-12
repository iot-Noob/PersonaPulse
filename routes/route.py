from fileinput import filename
from re import T
from tkinter import NO
from token import OP
from Models.gpt_mod import OpenAIModel
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse,StreamingResponse
from Models.main_model import ChainRequest,RoleEnum,Prompt_Input
from Models.dyn_enum import get_character_enum
from openai import OpenAI
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import json
from uuid import uuid4
from typing import Optional
load_dotenv()
base_dir = os.path.dirname(os.path.abspath(__file__))
roles_dir = os.path.join(base_dir, "../Roles")
manifest_path = os.path.join(roles_dir, "manifest.json")

gc=get_character_enum()

@asynccontextmanager
async def lifespan(app: APIRouter):
    print("STARTUP: Init Groq client")
    apikey = os.getenv("API_KEY")
    global client
    global mainf  
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

route = APIRouter(lifespan=lifespan)

@route.post(path="/simple_prompt", tags=["Simple_prompt"])
async def simple_prompt(role: RoleEnum, model: OpenAIModel, prompt: Prompt_Input, temperature: float = 0.3,character: Optional[gc] = None):
    try:
      
        if not (0.0 <= temperature <= 1.0):
            raise HTTPException(status_code=400, detail="Temperature must be between 0.0 and 1.0")

        messages = [
            {
                "role": role.value,  # Convert enum to string
                "content": prompt.prompt,
          
            }
        ]
        if role.value == "tool":
            messages[0]["tool_call_id"] = str(uuid4())
        msg2=[]
        if character is None:

            res = client.chat.completions.create(
                model=model.value,
                messages=messages,
                temperature=temperature,
            )
        else:
            for k,v in mainf.items():
                for va in v:
                    if va["subname"]==character.value:
                        bpa=os.path.join(roles_dir,va["file"])
                        if os.path.exists(bpa):
                            with open(bpa,'r',encoding='utf-8') as f:
                              persona:dict=json.load(f)
                            msg2.append(persona)
                            msg2.append({"role":role.value,"content":prompt.prompt,"tool_call_id":str(uuid4())})
                           
                            res = client.chat.completions.create(
                                model=model.value,
                                messages=msg2,
                                temperature=temperature,
                               
                            )
                        else:
                            raise HTTPException(404,"Path invalid")
        if not res:
            raise JSONResponse("No response",200)
         
        return {
            "response": res.choices[0].message.content,
            "model": model,
            "role": role
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
 