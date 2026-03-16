import json
import os

manifest_path = '/Users/apple/Desktop/文件/kaiwu_dida/.kaiwu-manifest.json'
root_dir = '/Users/apple/Desktop/文件/kaiwu_dida'

print(f"Reading manifest from {manifest_path}")
with open(manifest_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

resources = data.get('resources', {})
keys_to_delete = []

for key, res in resources.items():
    if res.get('isNew') is True:
        path = res.get('path', '')
        res_type = res.get('type', '')
        full_path = os.path.join(root_dir, path)
        
        is_valid = False
        if res_type == 'lowcode':
            if os.path.isdir(full_path):
                is_valid = True
        elif res_type == 'form':
            if os.path.isfile(full_path) or os.path.isfile(full_path + '.json'):
                is_valid = True
        elif res_type == 'api':
            if os.path.isfile(full_path + '.json') or os.path.isfile(full_path + '.script.js'):
                is_valid = True
        
        if not is_valid:
            print(f"Deleting invalid resource: {key} type={res_type} path={path}")
            keys_to_delete.append(key)
        else:
            print(f"Keeping valid resource: {key} type={res_type} path={path}")

for key in keys_to_delete:
    del resources[key]

print(f"Total deleted: {len(keys_to_delete)}")

with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
