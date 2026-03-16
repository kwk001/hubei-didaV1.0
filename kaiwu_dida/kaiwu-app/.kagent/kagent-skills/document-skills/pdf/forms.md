**关键：你必须按顺序完成这些步骤。不要跳到编写代码。**

如果你需要填写 PDF 表单，首先检查 PDF 是否有可填写的表单字段。从此文件的目录运行此脚本：
 `python scripts/check_fillable_fields <file.pdf>`，根据结果转到"可填写字段"或"不可填写字段"并遵循这些说明。

# 可填写字段
如果 PDF 有可填写的表单字段：
- 从此文件的目录运行此脚本：`python scripts/extract_form_field_info.py <input.pdf> <field_info.json>`。它将创建一个 JSON 文件，其中包含以下格式的字段列表：
```
[
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "rect": ([left, bottom, right, top] bounding box in PDF coordinates, y=0 is the bottom of the page),
    "type": ("text", "checkbox", "radio_group", or "choice"),
  },
  // Checkboxes have "checked_value" and "unchecked_value" properties:
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "type": "checkbox",
    "checked_value": (Set the field to this value to check the checkbox),
    "unchecked_value": (Set the field to this value to uncheck the checkbox),
  },
  // Radio groups have a "radio_options" list with the possible choices.
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "type": "radio_group",
    "radio_options": [
      {
        "value": (set the field to this value to select this radio option),
        "rect": (bounding box for the radio button for this option)
      },
      // Other radio options
    ]
  },
  // Multiple choice fields have a "choice_options" list with the possible choices:
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "type": "choice",
    "choice_options": [
      {
        "value": (set the field to this value to select this option),
        "text": (display text of the option)
      },
      // Other choice options
    ],
  }
]
```
- 将 PDF 转换为 PNG（每页一个图像），使用此脚本（从此文件的目录运行）：
`python scripts/convert_pdf_to_images.py <file.pdf> <output_directory>`
然后分析图像以确定每个表单字段的目的（确保将边界框 PDF 坐标转换为图像坐标）。
- 创建一个 `field_values.json` 文件，采用以下格式，包含要为每个字段输入的值：
```
[
  {
    "field_id": "last_name", // Must match the field_id from `extract_form_field_info.py`
    "description": "The user's last name",
    "page": 1, // Must match the "page" value in field_info.json
    "value": "Simpson"
  },
  {
    "field_id": "Checkbox12",
    "description": "Checkbox to be checked if the user is 18 or over",
    "page": 1,
    "value": "/On" // If this is a checkbox, use its "checked_value" value to check it. If it's a radio button group, use one of the "value" values in "radio_options".
  },
  // more fields
]
```
- 从此文件的目录运行 `fill_fillable_fields.py` 脚本以创建填写的 PDF：
`python scripts/fill_fillable_fields.py <input pdf> <field_values.json> <output pdf>`
此脚本将验证你提供的字段 ID 和值是否有效；如果打印错误消息，请更正相应的字段并重试。

# 不可填写字段
如果 PDF 没有可填写的表单字段，你需要可视化确定数据应添加到何处并创建文本注释。完全按照以下步骤操作。你必须执行所有这些步骤以确保准确完成表单。每个步骤的详细信息如下。
- 将 PDF 转换为 PNG 图像并确定字段边界框。
- 创建一个包含字段信息和显示边界框的验证图像的 JSON 文件。
- 验证边界框。
- 使用边界框填写表单。

## 步骤 1：可视化分析（必需）
- 将 PDF 转换为 PNG 图像。从此文件的目录运行此脚本：
`python scripts/convert_pdf_to_images.py <file.pdf> <output_directory>`
该脚本将为 PDF 中的每一页创建一个 PNG 图像。
- 仔细检查每个 PNG 图像并识别所有表单字段和用户应输入数据的区域。对于用户应输入文本的每个表单字段，确定表单字段标签和用户应输入文本的区域的边界框。标签和条目边界框不得相交；文本条目框应仅包含应输入数据的区域。通常，此区域将紧邻其标签的旁边、上方或下方。条目边界框必须足够高和宽以包含其文本。

这些是你可能看到的一些表单结构示例：

*标签在框内*
```
┌────────────────────────┐
│ Name:                  │
└────────────────────────┘
```
输入区域应在"Name"标签的右侧并延伸到框的边缘。

*标签在线之前*
```
Email: _______________________
```
输入区域应在线的上方并包括其整个宽度。

*标签在线下*
```
_________________________
Name
```
输入区域应在线的上方并包括线的整个宽度。这对于签名和日期字段很常见。

*标签在线上*
```
Please enter any special requests:
________________________________________________
```
输入区域应从标签的底部延伸到线，并应包括线的整个宽度。

*复选框*
```
Are you a US citizen? Yes □  No □
```
对于复选框：
- 寻找小方框（□）- 这些是要定位的实际复选框。它们可能在标签的左侧或右侧。
- 区分标签文本（"Yes"、"No"）和可点击的复选框方块。
- 条目边界框应仅覆盖小方块，而不是文本标签。

### 步骤 2：创建 fields.json 和验证图像（必需）
- 创建一个名为 `fields.json` 的文件，其中包含表单字段和边界框的信息，格式如下：
```
{
  "pages": [
    {
      "page_number": 1,
      "image_width": (first page image width in pixels),
      "image_height": (first page image height in pixels),
    },
    {
      "page_number": 2,
      "image_width": (second page image width in pixels),
      "image_height": (second page image height in pixels),
    }
    // additional pages
  ],
  "form_fields": [
    // Example for a text field.
    {
      "page_number": 1,
      "description": "The user's last name should be entered here",
      // Bounding boxes are [left, top, right, bottom]. The bounding boxes for the label and text entry should not overlap.
      "field_label": "Last name",
      "label_bounding_box": [30, 125, 95, 142],
      "entry_bounding_box": [100, 125, 280, 142],
      "entry_text": {
        "text": "Johnson", // This text will be added as an annotation at the entry_bounding_box location
        "font_size": 14, // optional, defaults to 14
        "font_color": "000000", // optional, RRGGBB format, defaults to 000000 (black)
      }
    },
    // Example for a checkbox. TARGET THE SQUARE for the entry bounding box, NOT THE TEXT
    {
      "page_number": 2,
      "description": "Checkbox that should be checked if the user is over 18",
      "entry_bounding_box": [140, 525, 155, 540],  // Small box over checkbox square
      "field_label": "Yes",
      "label_bounding_box": [100, 525, 132, 540],  // Box containing "Yes" text
      // Use "X" to check a checkbox.
      "entry_text": {
        "text": "X",
      }
    }
    // additional form field entries
  ]
}
```

通过从此文件的目录为每一页运行此脚本来创建验证图像：
`python scripts/create_validation_image.py <page_number> <path_to_fields.json> <input_image_path> <output_image_path>

验证图像将在应输入文本的位置有红色矩形，并在标签文本上有蓝色矩形。

### 步骤 3：验证边界框（必需）
#### 自动相交检查
- 通过使用 `check_bounding_boxes.py` 脚本检查 fields.json 文件来验证边界框是否都不相交以及条目边界框是否足够高（从此文件的目录运行）：
`python scripts/check_bounding_boxes.py <JSON file>`

如果有错误，重新分析相关字段，调整边界框，并迭代直到没有剩余错误。记住：标签（蓝色）边界框应包含文本标签，条目（红色）框不应包含。

#### 手动图像检查
**关键：在没有可视化检查验证图像的情况下不要继续**
- 红色矩形必须仅覆盖输入区域
- 红色矩形不得包含任何文本
- 蓝色矩形应包含标签文本
- 对于复选框：
  - 红色矩形必须在复选框方块上居中
  - 蓝色矩形应覆盖复选框的文本标签

- 如果任何矩形看起来不对，请修复 fields.json，重新生成验证图像，并再次验证。重复此过程，直到边界框完全准确。


### 步骤 4：向 PDF 添加注释
从此文件的目录运行此脚本以使用 fields.json 中的信息创建填写的 PDF：
`python scripts/fill_pdf_form_with_annotations.py <input_pdf_path> <path_to_fields.json> <output_pdf_path>
