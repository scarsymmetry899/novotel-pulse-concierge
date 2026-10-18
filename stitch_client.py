import subprocess
import json
import time
import requests

PROJECT_ID = "14832196068156955722"
MCP_URL = "https://stitch.googleapis.com/mcp"

def get_token():
    return subprocess.check_output("gcloud auth print-access-token", shell=True).decode().strip()

def call_stitch(tool_name, args, timeout=120):
    token = get_token()
    payload = {
        "jsonrpc": "2.0",
        "id": int(time.time() * 1000) % 1000000,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": args
        }
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Goog-User-Project": "ai-orchestrator-daily"
    }
    res = requests.post(MCP_URL, json=payload, headers=headers, timeout=timeout)
    data = res.json()
    if "error" in data:
        raise RuntimeError(f"RPC Error: {data['error']}")
    result = data.get("result", {})
    if result.get("isError"):
        raise RuntimeError(f"Tool Error: {result.get('content')}")
    return result

if __name__ == "__main__":
    print(f"Testing call to Stitch for Project {PROJECT_ID}")
    projects = call_stitch("get_project", {"name": f"projects/{PROJECT_ID}"})
    print("Project verified:", projects)
