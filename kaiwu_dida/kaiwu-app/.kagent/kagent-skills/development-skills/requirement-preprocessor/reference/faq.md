# 常见问题 (FAQ)

## Q: 什么时候使用 --no-llm？

A: 当需求文档格式非常标准化，或者需要快速处理大量文档时，可以使用 `--no-llm` 跳过 LLM 推断，仅使用规则匹配。

---

## Q: 如何提高推断准确度？

A:
1. 使用 LLM 模式（不加 `--no-llm`）
2. 确保需求文档格式规范
3. 在需求标题中包含明确的章节号（如 1.1.1）
4. 提供详细的需求描述

---

## Q: batch 模式和 infer -d 有什么区别？

A: 没有本质区别。`batch` 是 `infer -d` 的别名，为了命令语义更清晰。两者功能完全相同。

---

## Q: 输出目录在哪里？

A: 默认在 `<project-dir>/analyzer-work/<output-dir>/` 目录下，其中 `<output-dir>` 由 `-o` 参数指定。

---

## Q: 为什么输出文件名固定为 inferred-requirements.json？

A: 使用固定文件名便于后续工具引用，无需每次指定文件名。taskId 保留在 JSON 内部用于追溯。

---

## Q: sourceFile 字段有什么作用？

A: `sourceFile` 仅用于追溯原始需求来源，不影响后续处理。`content` 字段包含完整需求内容，后续工具无需访问原始文档。

---

## Q: 置信度低于 0.6 怎么办？

A: 建议人工审核这些需求的推断结果，可能需要：
- 调整需求文档格式
- 使用 LLM 模式重新推断
- 手动修正 inferred-requirements.json

---

## Q: 如何处理大量需求文档？

A: 使用 batch 模式的规则推断：

```bash
kagent-req-infer -d ./requirements/ \
  -p "$PROJECT_DIR" \
  -o wms-analysis \
  --no-llm \
  -y
```

- `--no-llm`: 跳过 LLM，速度快
- `-y`: 跳过所有确认提示，自动化处理

---

## Q: 推断结果不准确怎么办？

A:
1. 检查需求文档格式是否规范
2. 使用 LLM 模式（不加 `--no-llm`）
3. 查看 `analysis.md` 了解推断过程
4. 根据需要手动调整 `inferred-requirements.json`

---

## Q: 如何保留多个版本的推断结果？

A: 使用不同的 `-o` 参数：

```bash
# 版本 1
kagent-req-infer -d ./requirements/ -p "$PROJECT_DIR" -o wms-v1

# 版本 2
kagent-req-infer -d ./requirements/ -p "$PROJECT_DIR" -o wms-v2
```

---

## Q: 文本输入模式有什么限制？

A: 文本输入适合简短需求，不适合复杂的多层次需求。对于复杂需求，建议：
1. 创建 Markdown 文件
2. 使用文件输入模式（`-f`）

---

## Q: 如何调试推断失败的问题？

A:
1. 添加 `-v` 参数查看详细日志
2. 检查输出目录是否存在
3. 查看 `analysis.md` 了解推断过程
4. 检查需求文档格式是否符合预期
