# agents/risk_matrix_agent.py
import os
import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .utils import RISK_LIST, BASE_SEVERITY, MITIGATION, TARGET_DATE

# Load your API key from the environment
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class RiskIn(BaseModel):
    summary: str

class RiskOut(BaseModel):
    markdown_table: str

@router.post("/", response_model=RiskOut)
def run_risk_matrix(payload: RiskIn):
    summary = payload.summary.strip()
    if not summary:
        raise HTTPException(400, "Summary is required")

    system_prompt = f"""
You are a risk analysis expert. Here are the risks and metadata:
{RISK_LIST}

For each risk that applies:
 • Assign OWNER (“Data Engineering Team” for data risks; “Security Team” for security risks; “Compliance Team” for compliance risks).
 • Rate SEVERITY (1–5) with a one-sentence justification.
 • Reference MITIGATION from this map: {MITIGATION}
 • Reference TARGET_DATE from this map: {TARGET_DATE}

Output only a Markdown table with columns:
| Risk | Owner | Severity | Justification | Mitigation | Target Date |
Prefix your response with [RiskMatrixAgent].
"""

    resp = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": summary}
        ],
        temperature=0.5,
        max_tokens=800,
    )

    table = resp.choices[0].message.content.strip()
    return RiskOut(markdown_table=table)
