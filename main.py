from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
 
import openai

# Import router from your routes module
from routes.route import route as route_router

app = FastAPI(
    title="ChatGPT Chatbot for Specific Tasks",
    description="A chatbot for specific conversations, including chaining, logic, etc.",
    version="1.0.0.1"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include the router
app.include_router(route_router)
