import pandas as pd

# 读取Excel文件
file_path = '/Users/apple/Desktop/文件/kaiwu_dida/技术要求V1.1.xlsx'
df = pd.read_excel(file_path, sheet_name=None)

print('Sheet names:', list(df.keys()))

for sheet in df.keys():
    print(f'\n=== {sheet} ===')
    print(df[sheet].head(100).to_string())
