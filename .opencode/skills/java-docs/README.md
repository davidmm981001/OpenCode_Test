# Java Docs Skill

为 Java 代码生成和修复中文 Javadoc，重点保证标签语义正确、顺序一致，并支持在 CI 前做规范化检查。

## 功能

- 生成/修复类、接口、枚举、record、构造器、方法、字段的 Javadoc。
- 校验 `@param`、`@return`、`@throws`、`@since` 等标签与签名一致性。
- 支持两种策略：`strict`（新项目/强治理）与 `compatible`（存量项目/低侵入）。
- `strict`：新项目或强治理场景，要求更严格。
- `compatible`：存量项目低侵入修复场景。
- 提供一条命令执行 lint + eval 汇总。

## 目录结构

```text
.
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── spec.md
│   ├── profile-strict.md
│   ├── profile-compatible.md
│   └── javadoc-cheatsheet.md
├── scripts/
│   ├── javadoc_lint
│   └── run_eval.sh
└── evals/evals.json
```

## 快速使用

### 1) 本地校验

```bash
python3 scripts/javadoc_lint --profile strict src/main/java
```

如是存量项目，可切换：

```bash
python3 scripts/javadoc_lint --profile compatible src/main/java
```

### 2) 一条命令跑 lint + 评测汇总

```bash
scripts/run_eval.sh
```

常用参数：

```bash
scripts/run_eval.sh --profile compatible src/main/java
scripts/run_eval.sh --eval-file evals/evals.json --report-dir evals/reports
```

输出包括：

- `evals/reports/lint-*.log`
- `evals/reports/eval-summary-*.json`
- `evals/reports/eval-summary-*.md`
- `evals/reports/run-eval-*.json`

## 规则入口

- 主规范（唯一事实源）：`references/spec.md`
- 严格策略：`references/profile-strict.md`
- 兼容策略：`references/profile-compatible.md`
- 速查：`references/javadoc-cheatsheet.md`

## 发布到 skills.sh

1. 将仓库推送到公开 GitHub 仓库。  
2. 用 CLI 验证技能可发现：

```bash
npx skills add yeluod/java-doc --list
npx skills add yeluod/java-doc --skill java-docs
npx skills add https://github.com/yeluod/java-doc --skill java-docs

npx skills add yeluod/java-doc --skill java-docs -a codex -g

npx skills add yeluod/java-doc --list
```

3. 在 [skills.sh](https://skills.sh/) 搜索仓库或技能名确认展示。

## 适用场景

- 代码评审前统一注释风格。
- CI 中执行注释规范检查。
- 老项目逐步修复历史 Javadoc。
