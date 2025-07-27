# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from agents.chat_agent import router as chat_router
from agents.risk_matrix_agent import router as risk_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Unified Q&A agent
app.include_router(chat_router, prefix="/agent/chat")

# Risk analysis agent remains separate
app.include_router(risk_router, prefix="/agent/risk-matrix")
