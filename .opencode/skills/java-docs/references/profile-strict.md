# Profile: strict

适用场景：
- 新项目
- 文档规范治理
- 希望在 CI 中强约束

## 规则覆盖

- 类型声明必须包含：`@author`、`@version`、`@since`。
- `@since` 必须为版本语义（`x.y.z`）。
- `void` 方法禁止 `@return`。
- 非 `void` 方法必须存在 `@return`。
- 声明了 `throws` 的方法，必须有对应 `@throws`。

## 推荐启用时机

- 仓库首次引入注释规范。
- 关键模块准备长期维护。
