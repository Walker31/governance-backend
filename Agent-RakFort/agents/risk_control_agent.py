# agents/risk_control_agent.py
import os
import openai
import pandas as pd
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .utils import RISK_LIST, BASE_SEVERITY, MITIGATION, TARGET_DATE

# Load API key
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class RiskControlIn(BaseModel):
    summary: str
    session_id: str
    project_id: str | None = None
    controls_path: str = "predefined_controls.xlsx"  # Default path

class RiskOut(BaseModel):
    risk_id: str  # Generated ID for database storage
    risk_assessment_id: str  # Link to parent assessment
    risk_name: str
    risk_owner: str
    severity: int
    justification: str
    mitigation: str
    target_date: str

class ControlOut(BaseModel):
    control_id: str  # Generated ID for database storage
    risk_assessment_id: str  # Link to parent risk assessment
    code: str
    section: str
    control: str
    requirements: str
    status: str
    tickets: str
    related_risk: str  # Which risk this control addresses

class RiskControlOut(BaseModel):
    session_id: str
    project_id: str | None
    risk_assessment_id: str
    risk_matrix: str  # Markdown table
    control_matrix: str  # Markdown table
    parsed_risks: List[RiskOut]
    parsed_controls: List[ControlOut]
    stored_in_db: bool = False

def load_predefined_controls(path: str) -> Optional[pd.DataFrame]:
    """Loads the control library from the specified Excel file."""
    try:
        if not os.path.exists(path):
            print(f"❌ Controls file not found: {path}. Using default controls.")
            # Return a basic set of controls if file doesn't exist
            return create_default_controls()
        
        controls_df = pd.read_excel(path)
        print("✅ Successfully loaded predefined controls from Excel.")
        return controls_df
    except Exception as e:
        print(f"❌ Error reading controls file: {e}. Using default controls.")
        return create_default_controls()

def create_default_controls() -> pd.DataFrame:
    """Create a default set of controls if Excel file is not available."""
    default_controls = [
        {
            "CODE": "AC-001",
            "SECTION": "Access Control",
            "CONTROL": "User Authentication",
            "REQUIREMENTS": "Implement multi-factor authentication for all users"
        },
        {
            "CODE": "DM-001", 
            "SECTION": "Data Management",
            "CONTROL": "Data Encryption",
            "REQUIREMENTS": "Encrypt sensitive data at rest and in transit"
        },
        {
            "CODE": "AI-001",
            "SECTION": "AI Governance", 
            "CONTROL": "Model Validation",
            "REQUIREMENTS": "Validate AI models before deployment"
        },
        {
            "CODE": "SC-001",
            "SECTION": "Security",
            "CONTROL": "Vulnerability Assessment",
            "REQUIREMENTS": "Conduct regular security assessments"
        },
        {
            "CODE": "CM-001",
            "SECTION": "Compliance",
            "CONTROL": "Regulatory Compliance",
            "REQUIREMENTS": "Ensure compliance with relevant regulations"
        }
    ]
    return pd.DataFrame(default_controls)

def parse_markdown_table(table_content: str, risk_assessment_id: str) -> List[Dict[str, Any]]:
    """Parse markdown table and extract individual risks with generated IDs."""
    risks = []
    lines = table_content.strip().split('\n')
    
    # Skip header and separator lines
    data_lines = [line for line in lines if line.strip() and '|' in line and not line.startswith('|--')]
    
    # Skip the header row (first data line)
    if len(data_lines) > 1:
        data_lines = data_lines[1:]
    
    for idx, line in enumerate(data_lines):
        # Split by | and clean up
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        
        if len(cells) >= 6:  # We expect 6 columns
            risk_id = f"RISK-{risk_assessment_id}-{idx+1:03d}"
            risk = {
                'risk_id': risk_id,
                'risk_assessment_id': risk_assessment_id,
                'risk_name': cells[0],
                'risk_owner': cells[1], 
                'severity': int(cells[2]) if cells[2].isdigit() else 3,
                'justification': cells[3],
                'mitigation': cells[4],
                'target_date': cells[5]
            }
            risks.append(risk)
    
    return risks

def parse_control_table(table_content: str, risk_assessment_id: str, parsed_risks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Parse control matrix markdown table and create individual control objects."""
    controls = []
    lines = table_content.strip().split('\n')
    
    # Skip header and separator lines
    data_lines = [line for line in lines if line.strip() and '|' in line and not line.startswith('|--')]
    
    # Skip the header row
    if len(data_lines) > 1:
        data_lines = data_lines[1:]
    
    # Create a mapping of risk names for linking controls to risks
    risk_name_map = {risk['risk_name'].lower(): risk['risk_name'] for risk in parsed_risks}
    
    control_counter = 1
    for line in data_lines:
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        
        if len(cells) >= 6:  # CODE | SECTION | CONTROL | REQUIREMENTS | STATUS | TICKETS
            # Try to determine which risk this control addresses by matching keywords
            related_risk = "General"  # Default
            control_name = cells[2].lower()
            requirements = cells[3].lower()
            
            # Simple keyword matching to link controls to risks
            for risk_name_key, risk_name_full in risk_name_map.items():
                if any(keyword in control_name or keyword in requirements 
                      for keyword in risk_name_key.split()[:3]):  # Match first 3 words
                    related_risk = risk_name_full
                    break
            
            control_id = f"CTRL-{risk_assessment_id}-{control_counter:03d}"
            control = {
                'control_id': control_id,
                'risk_assessment_id': risk_assessment_id,
                'code': cells[0],
                'section': cells[1],
                'control': cells[2], 
                'requirements': cells[3],
                'status': cells[4],
                'tickets': cells[5],
                'related_risk': related_risk
            }
            controls.append(control)
            control_counter += 1
    
    return controls

async def generate_risk_matrix(summary: str) -> str:
    """Generate risk matrix using OpenAI."""
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
        Do not include any prefix text like [RiskMatrixAgent].
        """

    try:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": summary}
            ],
            temperature=0.5,
            max_tokens=800,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(500, f"Error generating risk matrix: {str(e)}")

async def generate_control_matrix(risk_matrix: str, controls_df: pd.DataFrame) -> str:
    """Generate control matrix using OpenAI."""
    controls_markdown = controls_df.to_markdown(index=False)
    
    system_prompt = f"""
You are an expert Control Assessment Agent for AI systems.
Your task is to analyze an incoming risk matrix and map appropriate controls to each identified risk.

1. **Analyze the Input**: The user will provide a risk matrix in markdown format.
2. **Use Predefined Controls**: You MUST select relevant controls from the official list provided below. Do not invent controls.

**Official Control List:**
{controls_markdown}

3. **Generate Control Matrix**: For each risk in the input matrix, create a corresponding entry in a new control matrix.
   - Select the most appropriate control(s) from the Official Control List.
   - Assess the implementation **STATUS**. You can set it to "Compliant", "In Progress", or "Not Implemented".
   - If the status is "In Progress" or "Not Implemented", create a placeholder **TICKET** number (e.g., TICK-123). Otherwise, set it to "None".

4. **Format the Output**: Return the control matrix as a single markdown table with these columns:
   `CODE | SECTION | CONTROL | REQUIREMENTS | STATUS | TICKETS`

If no risks are provided or no controls are applicable, respond with the table header and a single row stating "No applicable controls found."
Do not include any prefix or explanation text, just the markdown table.
"""

    try:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please perform a control assessment based on the following risk matrix:\n\n{risk_matrix}"}
            ],
            temperature=0.3,
            max_tokens=1000,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(500, f"Error generating control matrix: {str(e)}")

@router.post("/", response_model=RiskControlOut)
async def run_risk_control_assessment(payload: RiskControlIn):
    """
    Combined endpoint that generates both risk and control assessments.
    """
    summary = payload.summary.strip()
    session_id = payload.session_id
    project_id = payload.project_id
    controls_path = payload.controls_path
    
    if not summary:
        raise HTTPException(400, "Summary is required")
    
    if not session_id:
        raise HTTPException(400, "Session ID is required")

    try:
        # Step 1: Generate Risk Matrix
        print("🔍 Generating risk matrix...")
        risk_matrix = await generate_risk_matrix(summary)
        
        # Generate assessment ID first
        risk_assessment_id = f"RC-{session_id[:8].upper()}"
        
        # Parse risks with generated IDs
        parsed_risks_data = parse_markdown_table(risk_matrix, risk_assessment_id)
        
        # Step 2: Load Controls
        print("📋 Loading predefined controls...")
        controls_df = load_predefined_controls(controls_path)
        if controls_df is None:
            raise HTTPException(500, "Failed to load controls")
        
        # Step 3: Generate Control Matrix
        print("🛡️ Generating control matrix...")
        control_matrix = await generate_control_matrix(risk_matrix, controls_df)
        
        # Parse controls with generated IDs and risk linkage
        parsed_controls_data = parse_control_table(control_matrix, risk_assessment_id, parsed_risks_data)
        
        # Step 4: Format response
        
        # Convert parsed data to Pydantic models
        parsed_risks = [RiskOut(**risk) for risk in parsed_risks_data]
        parsed_controls = [ControlOut(**control) for control in parsed_controls_data]
        
        print("✅ Risk and control assessment completed successfully!")
        print(f"📊 Generated {len(parsed_risks)} risks and {len(parsed_controls)} controls")
        
        return RiskControlOut(
            session_id=session_id,
            project_id=project_id,
            risk_assessment_id=risk_assessment_id,
            risk_matrix=risk_matrix,
            control_matrix=control_matrix,
            parsed_risks=parsed_risks,
            parsed_controls=parsed_controls,
            stored_in_db=False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in risk-control assessment: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")