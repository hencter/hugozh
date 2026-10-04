+++
title = "cast.ToString"
linkTitle = "cast.ToString"
description = "返回给定值转换后的字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/cast/tostring/"

[params.functions_and_methods]
signatures = ["cast.ToString INPUT"]
returnType = "string"
aliases = ["string"]

[[params.examples]]
id    = "cast/to-string-types"
title = "把数字与布尔值转成字符串"
+++

## 这一页解决什么问题

模板里经常需要「字符串」这个类型本身：把数字参数拼进 `href`、把两个值用 `printf` 接起来、把变量交给 [`strings`](/functions/strings/) 系列函数处理、或者把值塞进要求 `string` 的参数里。Hugo 在输出时虽然会自动把值渲染成文本，但**在拼接、比较、传参这些位置它不会替你转**——类型不对就会报错或得到意料之外的结果。

`string`（即 `cast.ToString`）就是这一步显式转换：给它任何标量，它返回 `string`。

## 什么时候用，什么时候别用

**该用**：

- 要把数字、布尔值当文本用：拼接、`printf "%s"`、写入 `href`/`class` 这类字符串位置；
- 要把值传给只接受 `string` 的参数（例如 [`strings.TrimLeft`](/functions/strings/trimleft/) 的第一个参数）；
- 想把变量统一成字符串后再比较，避免 `11` 与 `"11"` 不相等。

**别用**：

- 只是想把值输出到页面上 → 直接 `{{ . }}`，Go 模板本来就会把它渲染成文本，不必多写一层；
- 想把时间转成可读文本 → 用 [`time.Format`](/functions/time/format/)；`string` 得到的是 Go 的默认时间格式，几乎不会是你想要的；
- 想把切片、映射、结构体转成文本 → 该用 [`jsonify`](/functions/encoding/jsonify/)，或者 `printf "%v"`。**实测**：`string (slice 1 2)` 会让整个构建失败（见下文边界表）；
- 想解析字符串里的数字 → 这是反方向，用 [`cast.ToInt`](/functions/cast/toint/)、[`cast.ToFloat`](/functions/cast/tofloat/)；
- 想要布尔语义 → 用 [`cast.ToFloat`](/functions/cast/tofloat/) 或 `default`，`string` 只做文本化，不做判断。

## 上游给出的各种进制输入结果

输入为十进制（base 10）时：

```go-html-template
{{ string 11 }} → 11 (string)
{{ string "11" }} → 11 (string)

{{ string 11.1 }} → 11.1 (string)
{{ string "11.1" }} → 11.1 (string)

{{ string 11.9 }} → 11.9 (string)
{{ string "11.9" }} → 11.9 (string)
```

输入为二进制（base 2）时：

```go-html-template
{{ string 0b11 }} → 3 (string)
{{ string "0b11" }} → 0b11 (string)
```

输入为八进制（base 8）时（两种记法都可用）：

```go-html-template
{{ string 011 }} → 9 (string)
{{ string "011" }} → 011 (string)

{{ string 0o11 }} → 9 (string)
{{ string "0o11" }} → 0o11 (string)
```

输入为十六进制（base 16）时：

```go-html-template
{{ string 0x11 }} → 17 (string)
{{ string "0x11" }} → 0x11 (string)
```

规律只有一条：**加了引号的就是字符串字面量，原样返回；不加引号的是数字字面量，先按它的进制求值再转成十进制文本**。

## 完整示例：把数字与布尔值转成字符串

下面四行是本站构建时**真实执行**的结果（模板文件在 `layouts/partials/examples/cast/to-string-types.html`）：

{{< examples >}}

**你应当看到什么**：`0x11` 这种**不带引号**的字面量先被求值成 17，再转成 `"17"`；`nil` 得到空字符串而不是报错；布尔得到 `"true"`。把 `$hex` 写成 `"0x11"`（加引号）输出会变成 `0x11`——这就是上面「规律只有一条」那句话的实际后果。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 数字（十进制/二进制/八进制/十六进制字面量） | 求值后的十进制文本，如 `string 0x11` → `17` | 否 |
| 加了引号的数字 | 原样返回，如 `string "0x11"` → `0x11` | 否 |
| `nil` | 空字符串 `""` | 否 |
| 布尔 `true` / `false` | `true` / `false` | 否 |
| `time.Time`（如 `now`） | Go 默认格式，实测 `string now` → `2026-10-03 01:48:22.9238628 +0800 CST m=+0.079159801` | 否 |
| 切片、映射、结构体（如 `(slice 1 2)`） | —— | 是：`error calling string: unable to cast []int{1, 2} of type []int to string` |
| 返回类型 | `string`，不会返回 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `string "0x11"` 输出 `0x11`，不是 `17` | 加了引号就是字符串字面量，`string` 对字符串不做进制解释 | 去掉引号，或先用 [`cast.ToInt`](/functions/cast/toint/) 解析 |
| 没报错但结果不对 | 时间显示成一长串带时区的结构 | `string` 对 `time.Time` 用的是 Go 默认格式 | 改用 [`time.Format`](/functions/time/format/) |
| 报错看不懂 | `unable to cast []int{1, 2} of type []int to string` | 给 `string` 传了切片/映射等非标量 | 用 [`jsonify`](/functions/encoding/jsonify/) 或 `printf "%v"` |
| 报错看不懂 | `wrong type for value; expected string; got int` | 把 `string` 的结果当数字传给了要求 `int` 的函数 | 那是反方向转换，用 [`cast.ToInt`](/functions/cast/toint/) |

更多排查入口见[故障排查](/troubleshooting/)。
