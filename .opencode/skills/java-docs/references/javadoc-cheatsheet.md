# Javadoc 速查

本文件是快速索引，详细规则以 `references/spec.md` 为准。

## 1. 必记约束

- 注释说明文本使用中文简体。
- `@param` 顺序必须与签名一致。
- `void` 方法不写 `@return`；非 `void` 方法必须写 `@return`。
- `@since` 必须是版本语义（如 `1.0.0`）。

## 2. 标签顺序

- 类型：`@author` -> `@version` -> `@since` -> `@deprecated` -> `@see`
- 构造器：`@param` -> `@throws` -> `@deprecated` -> `@see`
- 方法：`@param` -> `@return` -> `@throws` -> `@deprecated` -> `@see`
- 字段：`@deprecated` -> `@see`

## 3. 类型标注规则

- primitive：映射为包装类型并使用 `{@link ...}`。
- 泛型/集合/映射：使用 `{@code ...}`。
- 普通引用类型：优先 `{@link ...}`。

## 4. profile 选择

- 新项目或强治理：`profile-strict`
- 存量项目低风险改造：`profile-compatible`

## 5. 参考入口

- 规范主文档：`references/spec.md`
- 严格策略：`references/profile-strict.md`
- 兼容策略：`references/profile-compatible.md`
- 自动校验脚本：`scripts/javadoc_lint`
