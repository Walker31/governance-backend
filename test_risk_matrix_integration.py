#!/usr/bin/env python3
"""
Test script to verify risk matrix agent database integration
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_risk_matrix_storage():
    """Test the risk matrix agent with database storage"""
    
    # Test data
    test_data = {
        "summary": "AI system for customer data analysis with machine learning models",
        "session_id": "test-session-123",
        "project_id": "507f1f77bcf86cd799439011"  # Example MongoDB ObjectId
    }
    
    # Agent endpoint
    agent_url = "http://localhost:8000/agent/risk-matrix"
    
    try:
        print("Testing risk matrix agent...")
        response = requests.post(agent_url, json=test_data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Risk matrix analysis successful!")
            print(f"Session ID: {result.get('session_id')}")
            print(f"Stored in DB: {result.get('stored_in_db')}")
            print(f"Markdown table length: {len(result.get('markdown_table', ''))}")
            
            # Test retrieving from database
            if result.get('stored_in_db'):
                backend_url = "http://localhost:3001"
                db_response = requests.get(f"{backend_url}/risk-matrix-results/session/{result['session_id']}")
                
                if db_response.status_code == 200:
                    db_result = db_response.json()
                    print("✅ Database retrieval successful!")
                    print(f"DB ID: {db_result.get('_id')}")
                    print(f"Project ID: {db_result.get('projectId')}")
                else:
                    print(f"❌ Database retrieval failed: {db_response.status_code}")
            else:
                print("⚠️  Result not stored in database (backend may not be running)")
                
        else:
            print(f"❌ Risk matrix analysis failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to agent service. Make sure it's running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_backend_api():
    """Test the backend API directly"""
    
    test_data = {
        "projectId": "507f1f77bcf86cd799439011",
        "sessionId": "test-backend-session-456",
        "summary": "Test AI governance assessment",
        "markdownTable": "| Risk | Owner | Severity | Justification | Mitigation | Target Date |\n|------|-------|----------|---------------|------------|-------------|",
        "riskData": {
            "test": "data"
        }
    }
    
    backend_url = "http://localhost:3001"
    
    try:
        print("\nTesting backend API directly...")
        response = requests.post(f"{backend_url}/risk-matrix-results", json=test_data)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Backend API test successful!")
            print(f"Created ID: {result.get('_id')}")
            print(f"Session ID: {result.get('sessionId')}")
        else:
            print(f"❌ Backend API test failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend service. Make sure it's running on port 3001")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🧪 Testing Risk Matrix Database Integration")
    print("=" * 50)
    
    test_backend_api()
    test_risk_matrix_storage()
    
    print("\n" + "=" * 50)
    print("Test completed!") 