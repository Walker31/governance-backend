import os
import pandas as pd
from dotenv import load_dotenv
from agents import Agent, Runner
import asyncio # <-- ADDED: Import the asyncio library

# ======================
# Load Predefined Controls from Excel
# ======================

def load_predefined_controls(path: str):
    """Loads the control library from the specified Excel file."""
    try:
        controls_df = pd.read_excel(path)
        print("✅ Successfully loaded predefined controls from Excel.")
        return controls_df
    except FileNotFoundError:
        print(f"❌ Error: The control file '{path}' was not found. Please ensure it exists.")
        return None
    except Exception as e:
        print(f"❌ Error: Failed to read the controls Excel file. Reason: {e}")
        return None

# ======================
# Control Assessment Agent Definition
# ======================

def create_control_assessment_agent(controls_df: pd.DataFrame):
    """Creates the Control Assessment Agent with dynamic instructions."""
    controls_markdown = controls_df.to_markdown(index=False)
    agent_instructions = f"""
You are an expert Control Assessment Agent for AI systems.
Your task is to analyze an incoming risk matrix and map appropriate controls to each identified risk.
1.  **Analyze the Input**: The user will provide a risk matrix in markdown format.
2.  **Use Predefined Controls**: You MUST select relevant controls from the official list provided below. Do not invent controls.

    **Official Control List:**
    {controls_markdown}

3.  **Generate Control Matrix**: For each risk in the input matrix, create a corresponding entry in a new control matrix.
    -   Select the most appropriate control(s) from the Official Control List.
    -   Assess the implementation **STATUS**. You can set it to "Compliant", "In Progress", or "Not Implemented".
    -   If the status is "In Progress" or "Not Implemented", create a placeholder **TICKET** number (e.g., TICK-123). Otherwise, set it to "None".
4.  **Format the Output**: Return the control matrix as a single markdown table with these columns:
    `CODE | SECTION | CONTROL | REQUIREMENTS | STATUS | TICKETS`

    If no risks are provided or no controls are applicable, respond with the table header and a single row stating "No applicable controls found."
"""
    control_agent = Agent(
        name="ControlAssessmentAgent",
        instructions=agent_instructions,
    )
    return control_agent

# ======================
# Main Execution Logic
# ======================

# UPDATED: The function is now declared as async
async def run_control_assessment(risk_matrix_path: str, controls_path: str):
    """
    Loads data from Excel files and runs the Control Assessment Agent.
    """
    predefined_controls_df = load_predefined_controls(controls_path)
    if predefined_controls_df is None:
        return

    try:
        risk_df = pd.read_excel(risk_matrix_path)
        print(f"✅ Successfully loaded risk matrix from '{risk_matrix_path}'.")
        print("-" * 30)
    except FileNotFoundError:
        print(f"❌ Error: The risk matrix file '{risk_matrix_path}' was not found.")
        return
    except Exception as e:
        print(f"❌ Error: Failed to read the risk matrix file. Reason: {e}")
        return

    risk_matrix_markdown = risk_df.to_markdown(index=False)
    user_prompt = f"""
Please perform a control assessment based on the following risk matrix:

{risk_matrix_markdown}
"""
    print("🤖 Instantiating Control Assessment Agent...")
    assessment_agent = create_control_assessment_agent(predefined_controls_df)
    print("▶️ Running agent to generate control matrix...")
    print("-" * 30)

    # UPDATED: Use 'await' to call the async function
    result = await Runner.run(assessment_agent, user_prompt)

    print("✅ Agent execution complete. Final Output:")
    print(result.final_output.strip())


if __name__ == "__main__":
    load_dotenv()
    risk_matrix_file = os.getenv("RISK_MATRIX_PATH", "risk_matrix.xlsx")
    predefined_controls_file = os.getenv("CONTROLS_PATH", "predefined_controls.xlsx")

    # UPDATED: Use asyncio.run() to execute the top-level async function
    asyncio.run(run_control_assessment(risk_matrix_file, predefined_controls_file))