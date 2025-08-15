# agents/risk_matrix_agent.py
import os
import openai
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from .utils import RISK_LIST, BASE_SEVERITY, MITIGATION, TARGET_DATE

# Load your API key from the environment
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class RiskIn(BaseModel):
    summary: str
    session_id: str
    project_id: str | None = None

class RiskOut(BaseModel):
    markdown_table: str
    session_id: str
    stored_in_db: bool = False
    risk_assessment_id: str | None = None
    parsed_risks: List[Dict[str, Any]] = []

def parse_markdown_table(table_content: str) -> list:
    """Parse markdown table and extract individual risks"""
    risks = []
    lines = table_content.strip().split('\n')
    
    # Skip header and separator lines
    data_lines = [line for line in lines if line.strip() and '|' in line and not line.startswith('|--')]
    
    for line in data_lines:
        # Split by | and clean up
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        
        if len(cells) >= 6:  # We expect 6 columns: Risk, Owner, Severity, Justification, Mitigation, Target Date
            risk = {
                'risk_name': cells[0],
                'risk_owner': cells[1],
                'severity': int(cells[2]) if cells[2].isdigit() else 3,  # Default to 3 if not a number
                'justification': cells[3],
                'mitigation': cells[4],
                'target_date': cells[5]
            }
            risks.append(risk)
    
    return risks

@router.post("/", response_model=RiskOut)
def run_risk_matrix(payload: RiskIn):
    summary = payload.summary.strip()
    session_id = payload.session_id
    project_id = payload.project_id
    
    if not summary:
        raise HTTPException(400, "Summary is required")
    
    if not session_id:
        raise HTTPException(400, "Session ID is required")

    system_prompt = f"""
        You are a risk analysis expert. Here are the risks and metadata:
        {RISK_LIST}

        For each risk that applies:
        • Assign OWNER ("Data Engineering Team" for data risks; "Security Team" for security risks; "Compliance Team" for compliance risks).
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
    print(table)
    
    # Parse the markdown table to extract individual risks
    risks = parse_markdown_table(table)
    
    # Generate risk assessment ID
    risk_assessment_id = f"R-{session_id[:8].upper()}"
    
    # Store risks in database (this will be handled by the calling service)
    stored_in_db = False
    
    return RiskOut(
        markdown_table=table,
        session_id=session_id,
        stored_in_db=stored_in_db,
        risk_assessment_id=risk_assessment_id,
        parsed_risks=risks
    )
