# Java Docs 规范主文档（Single Source of Truth）

本文件是 `java-docs` 技能的唯一规范源。
所有规则以本文件为准；速查文档仅做摘要。

## 1. 范围

本规范适用于以下 Java 声明的 Javadoc 生成与修复：
- 类（class）
- 接口（interface）
- 枚举（enum）
- 记录（record）
- 构造器（constructor）
- 方法（method）
- 字段（field）

## 2. 全局约束

- 注释说明文本一律使用中文简体。
- 标识符、类型名、包名、类名保持代码原文，不翻译。
- 除注释块外，不修改业务逻辑和无关注释。
- 注释格式必须是标准 `/** ... */`，并与项目缩进风格一致。
- `@since` 严格使用版本语义，例如 `1.0.0`，不得使用时间戳。
- 标签顺序固定，且 `@param` 顺序必须与方法签名一致。

## 3. 声明模板

### 3.1 类/接口/枚举/记录

```java
/**
 * 类型功能描述。
 *
 * @author 邮箱(姓名)
 * @version 版本号
 * @since 1.0.0
 */
public class Example {}
```

### 3.2 构造器

```java
/**
 * 构造器功能描述。
 *
 * @param appName {@link String} 应用名称
 * @throws IllegalArgumentException 参数非法时抛出
 */
public App(String appName) {}
```

### 3.3 方法

```java
/**
 * 方法功能描述。
 *
 * @param count {@link Integer} 数量
 * @param name {@link String} 名称
 * @param tags {@code List<String>} 标签列表
 * @return {@link String} 返回值说明
 * @throws IllegalStateException 异常触发条件说明
 */
public String greet(int count, String name, List<String> tags) {}
```

### 3.4 字段

```java
/**
 * 字段用途说明。
 */
private String appName;
```

## 4. 标签规则

- `@param`：每个参数一行，顺序与签名完全一致。
- `@return`：仅非 `void` 方法保留；`void` 方法严禁出现。
- `@throws`：有显式 `throws` 声明或关键异常路径时补充。
- `@deprecated`：必须说明替代方案或迁移建议。
- `@see`：仅在存在明确关联 API 时补充。

### 4.1 标签顺序

- 类型声明：`@author` -> `@version` -> `@since` -> `@deprecated` -> `@see`
- 构造器：`@param` -> `@throws` -> `@deprecated` -> `@see`
- 方法：`@param` -> `@return` -> `@throws` -> `@deprecated` -> `@see`
- 字段：`@deprecated` -> `@see`

## 5. 类型标注决策表

| 场景 | 示例类型 | 标注方式 | 示例 |
| --- | --- | --- | --- |
| 基本类型（primitive） | `int`、`long`、`boolean` | 转换为包装类型后使用 `{@link ...}` | `int -> {@link Integer}` |
| 基本类型数组 | `int[]`、`char[]` | `{@code ...}` | `{@code int[]}` |
| 简单引用类型 | `String`、`Integer`、`Long`、`Boolean`、`BigDecimal`、`LocalDate` | `{@link ...}` | `{@link String}` |
| 枚举类型 | `Status` | `{@link ...}` | `{@link Status}` |
| 泛型/集合/映射 | `List<String>`、`Map<String, Object>` | `{@code ...}` | `{@code List<String>}` |
| 自定义对象（非泛型） | `UserProfile`、`OrderDTO` | `{@link ...}` | `{@link UserProfile}` |
| 数组/可变参数（引用类型） | `String[]`、`Object...` | `{@code ...}` | `{@code String[]}` |
| Optional 或嵌套泛型 | `Optional<User>`、`PageResult<User>` | `{@code ...}` | `{@code Optional<User>}` |

基本类型映射：
- `byte -> Byte`
- `short -> Short`
- `int -> Integer`
- `long -> Long`
- `float -> Float`
- `double -> Double`
- `char -> Character`
- `boolean -> Boolean`

## 6. 输出协议

支持三种输出模式：
- `patch`：默认模式。输出精确修改片段，最小化改动面。
- `full-file`：当用户明确要求完整文件时输出文件全量内容。
- `snippet`：当用户仅要求单个声明时输出该声明片段。

模式选择优先级：
- 用户显式要求 > 仓库约定 > 默认 `patch`

## 7. 质量门禁

- QG-01：注释说明是否为中文简体。
- QG-02：`@param` 参数名和顺序是否与签名一致。
- QG-03：`void` 方法是否错误出现 `@return`。
- QG-04：非 `void` 方法是否缺失 `@return`。
- QG-05：`@throws` 是否与声明异常一致（至少不缺失显式声明异常）。
- QG-06：`@since` 是否符合版本格式（示例：`1.0.0`）。
- QG-07：标签顺序是否符合本规范。
- QG-08：字段注释是否只描述用途，不滥用方法标签。

## 8. 自动化校验

可使用脚本执行基础门禁检查：

```bash
python3 scripts/javadoc_lint --profile strict src/main/java
```

脚本覆盖 QG-02/03/04/05/06/07 以及类型声明的基础元标签检查。
