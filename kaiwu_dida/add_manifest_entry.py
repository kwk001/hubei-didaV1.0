
import json
import os
import time

manifest_path = '.kaiwu-manifest.json'

def add_quality_center():
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
    # Using a fixed timestamp for consistency in this session
    timestamp = int(time.time() * 1000)
    new_key = f"local_lowcode_{timestamp}_quality_center"
    
    new_resource = {
      "type": "lowcode",
      "name": "全链路质量指挥中心",
      "code": "quality_command_center",
      "formCode": "quality_command_center",
      "path": "kaiwu-app/智慧工厂管控平台/可视化看板/全链路质量指挥中心",
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

    # Check if path already exists to avoid duplicates (though key is unique)
    exists = False
    for key, val in manifest.get('resources', {}).items():
        if val.get('path') == new_resource['path']:
            print(f"Resource already exists with key: {key}")
            exists = True
            break
    
    if not exists:
        manifest['resources'][new_key] = new_resource
        
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        print(f"Successfully added {new_resource['name']} to manifest")
    else:
        print("Skipping add.")

if __name__ == "__main__":
    add_quality_center()
