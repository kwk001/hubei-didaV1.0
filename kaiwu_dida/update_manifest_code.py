import json
import os

manifest_path = '.kaiwu-manifest.json'

def update_manifest():
    if not os.path.exists(manifest_path):
        print(f"Error: {manifest_path} not found")
        return

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return

    resources = manifest.get('resources', {})
    
    # Find and remove the old entry
    target_path = "kaiwu-app/智慧工厂管控平台/可视化看板/原材料质量监控平台"
    keys_to_remove = [k for k, v in resources.items() if v.get('path') == target_path]
    
    for k in keys_to_remove:
        print(f"Removing old entry: {k}")
        del resources[k]

    # Create new entry with Chinese code
    # Using a fixed timestamp for consistency or generated one
    new_key = "local_lowcode_1769930881465_material_quality" 
    
    new_resource = {
      "type": "lowcode",
      "name": "原材料质量监控平台",
      "code": "原材料质量监控平台", 
      "formCode": "material_quality_dashboard",
      "path": target_path,
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
    
    resources[new_key] = new_resource
    print(f"Added new entry: {new_key} with code='原材料质量监控平台'")

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print("Manifest updated successfully.")

if __name__ == "__main__":
    update_manifest()
