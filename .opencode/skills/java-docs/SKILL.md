---
name: java-docs
description: 为 Java 代码生成和修复中文 Javadoc，并校验 @param/@return/@throws/@since 等标签一致性。凡是用户提到补注释、修复 Javadoc、统一注释风格、注释规范化、CI 注释检查或标签对齐，都应优先使用本技能，即使用户没有显式提到技能名。
---

# Java Docs

## 目标

为 Java 声明生成可审阅、可维护、语义正确的 Javadoc，确保与签名一致并便于 CI 校验。

## 执行顺序

1. 识别声明类型与签名信息（类型/构造器/方法/字段）。
2. 选择 profile：
   - 默认 `strict`
   - 遇到存量项目或用户强调低侵入时用 `compatible`
3. 按规范生成或修复注释（以 `references/spec.md` 为准）。
4. 按输出协议返回结果（默认 `patch`）。
5. 按质量门禁逐项检查；可运行脚本做自动校验。

## 输出协议

支持三种模式：
- `patch`（默认）：输出最小改动片段。
- `full-file`：用户明确要求完整文件时使用。
- `snippet`：仅针对单个声明返回片段。

选择规则：用户显式要求 > 仓库约定 > 默认 `patch`。

## 规则来源

- 主规范（唯一事实源）：`references/spec.md`
- 严格策略：`references/profile-strict.md`
- 兼容策略：`references/profile-compatible.md`
- 速查摘要：`references/javadoc-cheatsheet.md`

如规则冲突，按以下优先级：
1. 用户当前明确要求
2. profile 约束
3. `references/spec.md`

## 自动化校验

```bash
python3 scripts/javadoc_lint --profile strict <java-path>
```

## 交付要求

- 只输出与请求相关的修改结果，不输出无关解释。
- 不修改业务逻辑和非注释内容。
- 标签顺序与签名必须严格一致。
