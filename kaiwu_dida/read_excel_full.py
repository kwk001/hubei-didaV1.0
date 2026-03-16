import pandas as pd

# 读取Excel文件
file_path = '/Users/apple/Desktop/文件/kaiwu_dida/技术要求V1.1.xlsx'
df = pd.read_excel(file_path, sheet_name=None)

print('Sheet names:', list(df.keys()))

for sheet in df.keys():
    print(f'\n{"="*80}')
    print(f'Sheet: {sheet}')
    print(f'{"="*80}')
    data = df[sheet]
    # 打印所有数据
    for idx, row in data.iterrows():
        print(f"Row {idx}: {row.tolist()}")
