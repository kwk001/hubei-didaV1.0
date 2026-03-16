import json
import os
import time

manifest_path = '.kaiwu-manifest.json'

def register_page():
    if not os.path.exists(manifest_path):
        print(f"Error: {manifest_path} not found")
        return

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return

    # Define the new resource
    timestamp = int(time.time() * 1000)
    new_key = f"local_lowcode_{timestamp}_material_quality"
    
    new_resource = {
      "type": "lowcode",
      "name": "原材料质量监控平台",
      "code": "material_quality_dashboard",
      "formCode": "material_quality_dashboard",
      "path": "kaiwu-app/智慧工厂管控平台/可视化看板/原材料质量监控平台",
      "groupNames": [
        "智慧工厂管控平台",
        "可视化看板"
      ],
      "files": [
        "index.jsx",
        "index.css",
        "schema.json",
        "assets.json"
      ],
      "appName": "智慧工厂管控平台",
      "isNew": True
    }

    # Check if path already exists
    exists = False
    for key, val in manifest.get('resources', {}).items():
        if val.get('path') == new_resource['path']:
            print(f"Resource already exists with key: {key}")
            # Optional: Update existing resource if needed
            manifest['resources'][key] = new_resource
            exists = True
            break
    
    if not exists:
        manifest['resources'][new_key] = new_resource
        print(f"Adding new resource: {new_resource['name']}")
    else:
        print(f"Updating existing resource: {new_resource['name']}")
        
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print("Manifest updated successfully.")

if __name__ == "__main__":
    register_page()
