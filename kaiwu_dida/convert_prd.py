from markitdown import MarkItDown
import os

def convert_docx():
    md = MarkItDown()
    source_path = "docs/视频教材管理PRD.docx"
    output_path = "docs/视频教材管理PRD_converted.md"
    
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found")
        return

    result = md.convert(source_path)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result.text_content)
    
    print(f"Successfully converted {source_path} to {output_path}")

if __name__ == "__main__":
    convert_docx()
