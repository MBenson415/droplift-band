"""
Upload local.settings.json values to Azure Static Web App application settings.

Usage:
  python scripts/set_azure_env.py --name <static-web-app-name> --resource-group <rg-name>

Requires:
  - Azure CLI installed and logged in (`az login`)
  - Python 3.7+
"""

import json
import subprocess
import argparse
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Push local.settings.json to Azure Static Web App")
    parser.add_argument("--name", required=True, help="Azure Static Web App name")
    parser.add_argument("--resource-group", required=True, help="Azure resource group")
    parser.add_argument("--settings-file", default="api/local.settings.json", help="Path to local.settings.json")
    args = parser.parse_args()

    settings_path = Path(args.settings_file)
    if not settings_path.exists():
        print(f"Error: {settings_path} not found.")
        sys.exit(1)

    with open(settings_path, "r") as f:
        data = json.load(f)

    values = data.get("Values", {})

    # Skip Azure Functions internal settings
    skip_keys = {"AzureWebJobsStorage", "FUNCTIONS_WORKER_RUNTIME"}
    env_vars = {k: v for k, v in values.items() if k not in skip_keys and v}

    if not env_vars:
        print("No environment variables to set.")
        sys.exit(0)

    print(f"Setting {len(env_vars)} app settings on '{args.name}'...\n")

    for key, value in env_vars.items():
        print(f"  Setting {key}...")
        result = subprocess.run(
            [
                "az", "staticwebapp", "appsettings", "set",
                "--name", args.name,
                "--resource-group", args.resource_group,
                "--setting-names", f"{key}={value}",
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"  ERROR: {result.stderr.strip()}")
        else:
            print(f"  OK")

    print("\nDone.")


if __name__ == "__main__":
    main()
