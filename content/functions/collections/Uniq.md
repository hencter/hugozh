+++
title = "collections.Uniq"
linkTitle = "uniq"
description = "去掉给定切片中的重复元素后返回。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/functions/collections/uniq/"

[params.functions_and_methods]
signatures = ["collections.Uniq SLICE"]
returnType = "[]any"
aliases = ["uniq"]

[[params.examples]]
id    = "collections/uniq-tags"
title = "标签去重后再排序"
+++

## 这一页解决什么问题

列表里混进了重复项时（多个页面共享同一个标签、两次 `append` 后出现重复），用 `uniq` 去重。它的行为是**保序去重**：保留每个值**第一次出现**的位置。实测 `slice "b" "a" "b" "c"` 得到 `[b a c]`，不是排序后的 `[a b c]`。

需要「去重且有序」时，在 `uniq` 后面接一个 [`collections.Sort`](/functions/collections/sort/)。

## 什么时候用，什么时候别用

**该用**：

- 汇总多个页面的 `Params.tags` 后得到一份不重复的标签表；
- 接在 [`collections.Append`](/functions/collections/append/) 或 [`collections.Union`](/functions/collections/union/) 之后做净化；
- 需要「去重且保序」——保留首次出现顺序。

**别用**：

- 想表达「合并两个集合」的语义 → 用 [`collections.Union`](/functions/collections/union/)（它同样去重，但对页面集合更直观）；
- 想排序 → 用 [`collections.Sort`](/functions/collections/sort/)；
- 输入是**字符串** → 实测报错 `type string not supported`，先 [`strings.Split`](/functions/strings/split/) 成切片；
- 想按字段判断「重复」（例如两个页面标题相同）→ `uniq` 比较的是**元素本身**，页面集合请改用 `where` 或按 key 手工去重。

## 用法

```go-html-template
{{ slice 1 3 2 1 | uniq }} → [1 3 2]
```

## 完整示例：标签去重后再排序

下面五行是本站构建时**真实执行**的结果（模板文件在 `layouts/partials/examples/collections/uniq-tags.html`）：

{{< examples >}}

**你应当看到什么**：`uniq` 保留了首次出现的顺序（`Hugo` 在 `Go` 之前）；再接 `collections.Sort` 才变成排序结果；空切片不报错，直接返回空切片。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 空切片 | 空切片 | 否 |
| 输入是 `nil` | 空切片，不报错 | 否 |
| 顺序 | 保留首次出现的顺序（实测 `b a b c` 得 `[b a c]`） | 否 |
| 元素是映射且内容相同 | 能识别为重复：实测 `slice (dict "a" 1) (dict "a" 1) (dict "a" 2)` 得 `[map[a:1] map[a:2]]` | 否 |
| 输入是字符串 | —— | 是：`error calling uniq: type string not supported` |
| 返回类型 | 签名写作 `[]any`；元素同型时实测是 `[]int` 这类具体切片 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 去重后的顺序「变了」 | `uniq` 按首次出现顺序保留，不是按值排序 | 需要排序就再接 [`collections.Sort`](/functions/collections/sort/) |
| 报错看不懂 | `type string not supported` | 把字符串传给了 `uniq` | 先 [`strings.Split`](/functions/strings/split/) 或 `split` 成切片 |
| 没报错但结果不对 | 看似不同的两项没有被去掉 | `uniq` 比较整个元素（映射按全部键值比较） | 按单一字段去重请改用手工 `range` 加 `isset` 判断 |
| 没报错但结果不对 | 页面集合去重后数量没变 | 每个 Page 都是不同对象，自然不会相等 | 按 `RelPermalink` 之类的 key 手工去重 |

更多排查入口见[故障排查](/troubleshooting/)。
