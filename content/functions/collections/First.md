+++
title = "collections.First"
linkTitle = "first"
description = "返回给定切片或字符串的前 N 个元素。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/collections/first/"

[params.functions_and_methods]
signatures = ["collections.First N SLICE|STRING"]
returnType = "any"
aliases = ["first"]

[[params.examples]]
id    = "collections/first-top-posts"
title = "只显示前 2 篇"
+++

## 这一页解决什么问题

列表页要做「最新 5 篇」「前 3 个标签」这类限量展示时，模板里没有取子集的语法，`collections.First` 就是标准答案：给它一个数量 `N` 和一个切片（或字符串），它返回前 `N` 个元素。

它只做「取前 N 个」这一件事：**不筛选、不排序**。筛选用 [`collections.Where`](/functions/collections/where/)，排序用 [`collections.Sort`](/functions/collections/sort/)。返回类型跟着输入走（签名里写作 `any`）：切片进、切片出；字符串进、字符串出。

## 什么时候用，什么时候别用

**该用**：

- 首页、侧栏要「最新的 N 篇」：先 `sort` 再 `first`；页面集合本身已按日期排好序时可直接取前几个；
- 结果要继续交给 `range`、`len` 处理——它返回的就是切片；
- 取最后 N 个用 [`collections.Last`](/functions/collections/last/)，反转顺序用 [`collections.Reverse`](/functions/collections/reverse/)。

**别用**：

- 想按条件挑元素 → 用 [`collections.Where`](/functions/collections/where/)，不要拿 `first` 加手工判断去凑；
- 想截断**中文**或带变音符号的字符串 → `first` 对字符串是按**字节**切的，一个汉字占 3 个字节，会切出半个字符（实测见文末）。按单词边界截断用 [`strings.Truncate`](/functions/strings/truncate/)，按字符数截断用 [`strings.Substr`](/functions/strings/substr/)；
- 想「跳过前 N 个再取」→ `first` 没有偏移参数，需要先用 `where` 收窄，或改用 [`collections.Last`](/functions/collections/last/) 换个方向取。

## 用法

```go-html-template
{{ slice "a" "b" "c" | first 1 }} → [a]
{{ slice "a" "b" "c" | first 2 }} → [a b]
```

由于字符串实际上就是只读的字节切片，该函数可用于返回字符串开头指定数量的字节：

```go-html-template
{{ "abc" | first 1 }} → a
{{ "abc" | first 2 }} → ab
```

注意一个_字符_可能由多个_字节_组成：

```go-html-template
{{ "Schön" | first 3 }} → Sch
{{ "Schön" | first 4 }} → Sch\xc3
{{ "Schön" | first 5 }} → Schö
```

要在页面集合上使用 `collections.First` 函数：

```go-html-template
{{ range first 5 .Pages }}
  {{ .Render "summary" }}
{{ end }}
```

把 `N` 设为 0 可返回空切片：

```go-html-template
{{ $emptyPageCollection := first 0 .Pages }}
```

`first` 与 [`where`][] 一起使用：

```go-html-template
{{ range where .Pages "Section" "articles" | first 5 }}
  {{ .Render "summary" }}
{{ end }}
```

## 完整示例：只显示前 2 篇

`first` 不依赖页面结构，用 `slice` 就能直接验证——下面是本站构建时**真实执行**的结果（模板文件在 `layouts/partials/examples/collections/first-top-posts.html`）：

{{< examples >}}

**你应当看到什么**：`first 2` 只输出前两项；`N` 超过元素总数时**不报错**，返回整个切片；`N` 为 0 得到空切片。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `N` 大于元素总数（`first 5` 作用于 3 元素切片） | 返回整个切片 | 否 |
| `N` 为 `0` | 空切片（`len` 为 0） | 否 |
| 输入是空切片 | 空切片 | 否 |
| 输入是字符串 | 返回前 `N` 个**字节**（`first 2 "abc"` 得 `ab`） | 否 |
| 字符串截断落在多字节字符中间（`first 4 "Schön"`） | `Sch` 加一个残缺字节（上游写作 `Sch\xc3`） | 否 |
| `N` 为负数 | —— | 是：`error calling first: sequence length must be non-negative` |
| `N` 不是整数（如 `"x"`） | —— | 是：`error calling first: unable to cast "x" of type string to int` |
| 输入是整数（如 `42`） | —— | 是：`error calling first: can't iterate over int` |
| 输入是 `nil` | —— | 是：`error calling first: both limit and seq must be provided` |
| 返回类型 | 按输入定：`[]int` 进 `[]int` 出、字符串进字符串出（签名统一写作 `any`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 中文标题被截出乱码 | 字符串输入按**字节**截断 | 字符串改用 [`strings.Truncate`](/functions/strings/truncate/) 或 [`strings.Substr`](/functions/strings/substr/) |
| 没报错但结果不对 | 元素不足 `N` 时以为会补空位 | 实测返回整个切片，不补空 | 需要凑满数量时先判 `len` |
| 报错看不懂 | `error calling first: can't iterate over int` | 参数顺序是 `first N SLICE`，`N` 在前 | 改成 `first 5 .Pages` |
| 报错看不懂 | `both limit and seq must be provided` | 把 `nil` 传给了 `first` | 先用 `with` 判空再调用 |

更多排查入口见[故障排查](/troubleshooting/)。

[`where`]: /functions/collections/where/
