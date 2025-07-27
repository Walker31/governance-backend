# agents/utils.py
import pandas as pd
from pathlib import Path

# Load the Excel once
RISK_FILE = Path(__file__).parent.parent / "predefined_risks.xlsx"
df = pd.read_excel(RISK_FILE)

# Extract lists and maps
RISK_LIST     = df["RISK NAME"].tolist()
BASE_SEVERITY = dict(zip(df["RISK NAME"], df["BASE_SEVERITY"]))
MITIGATION    = dict(zip(df["RISK NAME"], df["MITIGATION"]))
TARGET_DATE   = dict(zip(df["RISK NAME"], df["TARGET_DATE"]))
