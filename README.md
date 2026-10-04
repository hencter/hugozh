# Hugo 中文布道站

把 Hugo 带到中文世界：一份**持续维护的简体中文文档镜像**，一个**面向 AI 编码代理的技能包**，以及一套**来自真实项目的踩坑记录**。

| | |
| --- | --- |
| 站点 | <https://hugozh.cn/> —— 21 个一级章节、949 个 Markdown 文件（上游 19 章 1:1 翻译 + 2 个原创章节：技能包与可运行示例） |
| 技能包 | [`.agents/skills/hugo-static-site/`](.agents/skills/hugo-static-site/) —— MIT 许可，可单独取用；站内也有介绍页 <https://hugozh.cn/skill/> |
| 许可 | 译文 [Apache-2.0](LICENSE-APACHE)（演绎自上游文档）· 代码与技能包 [MIT](LICENSE) · 署名见 [NOTICE](NOTICE) |
| 远端仓库 | <https://github.com/hencter/hugozh>（`main` 分支与 `v1.0.0` / `v1.1.0` / `v1.2.0` / `v1.3.0` 标签已推送） |

**仓库根目录就是站点根目录**：`hugo.toml`、`content/`、`themes/` 都在这一层，克隆下来直接在根目录执行 `hugo server` 即可，不需要再进任何子目录。

文档页**不只贴代码**：`/shortcodes/` 与 `/render-hooks/` 两章把示例的真实产物直接渲染在同一页上——图片、折叠块、高亮代码、二维码、播放器、站点自己的渲染钩子，都是构建时展开的真元素，而不是截图或产物转贴。

## 为什么做这件事

Hugo 极快、极稳，但中文世界的入门资料零散；而真正卡住人的往往不是概念，是**那些文档里没写、报错又指向别处**的坑——比如一个没有任何花括号的页面报「短代码未闭合」，真因是正文里出现了字面串 `HAHAHUGOSHORTCODE`。

这个仓库因此做三件事：把官方文档译成中文并保持与上游 1:1 对应；把踩过的坑固化成可检索的清单（技能包里的 G1–G28）；把这两样都交给 AI 编码代理，让它下次直接避开。

## 运行要求

| 项目 | 要求 |
| --- | --- |
| Hugo | **0.147 或更高版本**（已在 v0.147.5 与 v0.167.0 上实机构建验证） |
| 版本类型 | **标准版即可**，不需要 extended（项目不使用 SCSS 管道） |
| 站点配置键 | 使用 `locale`；该键在 0.158 之前名为 `languageCode`（Hugo 0.158.0 起弃用） |
| 其他 | 无外部主题、无需联网即可构建；Node 只在跑回归测试与生成品牌资产时才需要 |

在 0.158 之前的 Hugo 上，`locale` 键会被忽略（不影响构建与输出）；模板不依赖 0.158+ 的 `site.Language.Locale`，语言标签由 `[params] htmlLang` 提供，中文日期格式由中文叠加主题的 `[params] dateFormat` 提供。因此**部署平台自带的旧版 Hugo（如 EdgeOne Pages 的 0.147.5）可直接构建本站**。

## 安装 Hugo

构建命令假定 `hugo` 已在 PATH 中。各平台安装步骤见译文章节：

- [Windows](content/installation/windows.md)（Winget / Chocolatey / Scoop 等）
- [macOS](content/installation/macos.md)
- [Linux](content/installation/linux.md)
- [BSD](content/installation/bsd.md)（FreeBSD 的 pkg / pkgin）

在线阅读：<https://hugozh.cn/installation/>。

## 快速开始

所有命令都在**仓库根目录**（即本 README 所在目录）执行，路径均为相对路径：

```bash
hugo server          # 本地预览：http://localhost:1313/
hugo server -D       # 连同草稿（draft: true）一起预览
hugo                 # 构建静态站点，输出到 public/
hugo --minify        # 构建并压缩输出
```

- 首次构建时 Hugo 会在 `resources/_gen/` 下缓存指纹化后的 CSS/JS，属于正常现象。
- 线上域名：<https://hugozh.cn/>（已写入 `hugo.toml` 的 `baseURL`）。
- 部署到子路径（例如 `https://hugozh.cn/docs/`）时，先修改 `hugo.toml` 中的 `baseURL` 再构建。
- **不要在任何子目录里跑 `hugo`**：子目录不是站点根，Hugo 会另建一个极小站点并**同样返回退出码 0**（实测 `.translation/` 下为 `Pages │ 4`，本站是 1966 页）。

## 目录结构

```text
hugozh/                                   ← 仓库根 = 站点根
├── hugo.toml                            # 站点配置：baseURL、locale、菜单、Markdown 与高亮设置
├── hugo.nogit.toml                      # 无 `.git` 环境（部署平台只给源码）的兜底配置
├── archetypes/default.md                # `hugo new content` 的原型（六个前置元数据字段）
├── assets/
│   ├── brand/                           # 首页横幅拼贴用的品牌切图
│   └── images/examples/                 # 文档页演示用的全局资源
├── content/                             # 21 个一级章节、949 个 Markdown 文件
│   ├── _index.md                        # 首页
│   ├── getting-started/ … troubleshooting/   # 19 个译文章节（与上游 1:1 对应）
│   ├── examples/                        # 原创：可运行示例索引（示例实现在 layouts/）
│   └── skill/                           # 原创：技能包介绍页
├── data/glossary-alias.toml             # 术语别名表（HTML 钩子与 md 出口共用一份）
├── layouts/_default/baseof.html         # 项目约束层：只放跨主题共用的骨架（全项目仅此一个文件）
├── static/                              # favicon、CNAME、品牌图，以及 /skill/ 的镜像
├── themes/
│   ├── hugo-docs-theme/                 # 基础层：页面模板、partials、_markup 渲染钩子、
│   │                                    #        _shortcodes（note/banner/quick-reference/demo/wrap）、CSS/JS
│   └── hugo-docs-theme-zh/              # 中文叠加层：只做 CJK 排版（cjk.css + 开关参数）
├── .agents/skills/hugo-static-site/        # 面向 AI 代理的技能包（SKILL.md + 10 篇 references）
├── .translation/                        # 翻译作业手册、审计脚本、品牌资产生成
├── .testing/                            # Playwright 回归（ui / search / sidebar / demo-check）
├── .deploy/                             # 发布相关：IndexNow 提交脚本
└── package.json                         # 仅用于品牌资产生成、发布提交与回归测试的 Node 依赖

（`.git`、`node_modules/`、`public/`、`resources/` 等未列出；`.agents/`、`.translation/`、`.testing/`、`.deploy/`
  是点开头的工具目录，既不出现在 Hugo 的构建里，也不影响站点结构。）
```

每个一级章节目录下均有一个 `_index.md`（章节导语，同时作为列表页内容）和若干主题页。

## 页面清单

共 **21 个一级章节、949 个 Markdown 文件**。其中 19 章与上游 1:1 对应，另有 2 章是本站原创：[可运行示例](/examples/)（示例实现在 `layouts/`，见下文「可运行示例」）与[技能包](/skill/)。「页数」为该章节目录下 `*.md` 的实际数量（含该章的 `_index.md`），顺序即侧栏顺序（按 `_index.md` 的 `weight`）。

| # | 章节（中文） | 目录 / 站点路径 | 页数 | weight |
| --- | --- | --- | ---: | ---: |
| 1 | 技能包（原创） | `content/skill/` · `/skill/` | 1 | 5 |
| 2 | 函数 | `content/functions/` · `/functions/` | 313 | 10 |
| 3 | 入门 | `content/getting-started/` · `/getting-started/` | 4 | 10 |
| 4 | 方法 | `content/methods/` · `/methods/` | 268 | 10 |
| 5 | 动态 | `content/news/` · `/news/` | 1 | 10 |
| 6 | 内容管理 | `content/content-management/` · `/content-management/` | 23 | 20 |
| 7 | 命令 | `content/commands/` · `/commands/` | 45 | 30 |
| 8 | 托管与部署 | `content/host-and-deploy/` · `/host-and-deploy/` | 15 | 40 |
| 9 | Hugo Pipes | `content/hugo-pipes/` · `/hugo-pipes/` | 10 | 50 |
| 10 | Hugo 模块 | `content/hugo-modules/` · `/hugo-modules/` | 5 | 60 |
| 11 | 模板 | `content/templates/` · `/templates/` | 14 | 70 |
| 12 | 渲染钩子 | `content/render-hooks/` · `/render-hooks/` | 9 | 80 |
| 13 | 短代码 | `content/shortcodes/` · `/shortcodes/` | 12 | 90 |
| 14 | 可运行示例（原创） | `content/examples/` · `/examples/` | 1 | 95 |
| 15 | 配置 | `content/configuration/` · `/configuration/` | 34 | 100 |
| 16 | 安装 | `content/installation/` · `/installation/` | 5 | 110 |
| 17 | 故障排查 | `content/troubleshooting/` · `/troubleshooting/` | 7 | 120 |
| 18 | 关于 | `content/about/` · `/about/` | 5 | 130 |
| 19 | 速查 | `content/quick-reference/` · `/quick-reference/` | 166 | 140 |
| 20 | 工具 | `content/tools/` · `/tools/` | 6 | 150 |
| 21 | 参与贡献 | `content/contribute/` · `/contribute/` | 4 | 160 |
| — | **合计** | **21 章** | **949** | |

另有一页全站首页（`content/_index.md`，不在上表）。规模最大的三章是 `functions/`（313 页）、`methods/`（268 页）与 `quick-reference/`（166 页，其中 `glossary/` 收录 159 条术语）。

> 上表按 `_index.md` 的 `weight` 排序，即侧栏顺序；早期归位调整（`getting-started/` 下的 `installation.md`、`configuration.md` 移入 `/installation/`、`/configuration/`，`content-management/` 下的 `types.md`、`emojis.md`、`render-hooks.md`、`shortcodes.md` 移入 `/templates/`、`/quick-reference/`、`/render-hooks/`、`/shortcodes/`）之后 `content/` 下 `.md` 总数与上表一致。

## 页面约定

每页使用 TOML 前置元数据（`+++` 分隔），一共六个字段，`archetypes/default.md` 已给出模板（全站首页 `content/_index.md` 例外，只有 `title`、`description`、`date`）：

```toml
+++
title = "页面标题"
linkTitle = "侧栏与导航中显示的短标题"
description = "一句话摘要"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/..."
+++
```

| 字段 | 作用 |
| --- | --- |
| `title` | 页面 `<h1>` 与浏览器标题 |
| `linkTitle` | 侧栏、上一篇 / 下一篇、首页链接中显示的文字（留空时 Hugo 回退到 `title`） |
| `description` | 页面导语，同时用于章节列表页与首页的章节简介 |
| `date` | 页面日期，渲染在页脚 |
| `weight` | **决定顺序**：同一章节内数字越小越靠前，左侧目录、首页链接、上一篇 / 下一篇都按它排序 |
| `source` | 上游英文原文地址，模板会把它渲染在页脚「英文原文：…」一行 |

正文书写约定：

- 一级标题由模板输出，**正文只用 `##` 及以下**，避免出现两个 `<h1>`；`##` 会进入右侧「本页目录」。
- 章节导语写在对应章节的 `_index.md` 里，它会同时出现在该章列表页顶部。
- 内部链接写站点内路径（如 `/shortcodes/#notation`），不要指向 gohugo.io。

## 短代码注意事项（重要）

**内容里不能出现未转义的 `{{<` 或 `{{%`。** Hugo 在 Markdown 解析**之前**就会扫描并提取短代码，**围栏代码块与行内代码都不豁免**（见 `content/content-management/syntax-highlighting.md` 的「转义」一节：文档给出的示例本身就写在围栏里，其中的转义仍被解析）；一旦出现未转义的定界符，Hugo 会去找同名短代码模板，找不到就报 `failed to extract shortcode: template for shortcode "…" not found`，**整个站点构建失败**（不是单页失败）。

要展示短代码语法本身，必须写成转义形式：

```text
{{</* name */>}}          →  页面显示 {{< name >}}
{{%/* name */%}}          →  页面显示 {{% name %}}
{{</*/* name */*/>}}      →  页面显示 {{</* name */>}}（要展示转义写法本身时）
```

本站 `content/` 下所有短代码示例均已使用转义写法；新增页面时请沿用该写法。

**另一个会把构建打挂的字面串：`HAHAHUGOSHORTCODE`。** 它是 Hugo 内部给短代码占位用的前缀。内容里一旦出现这个**完整字符串**，Hugo 的短代码状态机就会报：

```text
illegal state in content; shortcode token missing end delim
```

并且错误会**归因到正在渲染的那个页面上**（看起来像该页内容有问题，实际是这个字符串与占位符机制冲突）。本站 `content/troubleshooting/audit.md` 就曾因此整页从未渲染成功过。

需要展示它时，像上游文档那样在中间插入零宽字符（U+FEFF）打断字面串，渲染结果不变：

```text
H&#xfeff;AHAHUGOSHORTCODE   →  页面显示 HAHAHUGOSHORTCODE
```

注意 `&#xfeff;` 实体必须写在**代码 span 之外**：写在反引号里不会被解码，读者会看到实体本身。

## 主题与分层

样式不写在站点里，而是放在主题里；站点只保留**跨主题的约束**。配置文件用一条列表组合主题：

```toml
theme = ["hugo-docs-theme-zh", "hugo-docs-theme"]
```

| 层 | 位置 | 内容 |
| --- | --- | --- |
| 项目约束层 | `layouts/_default/baseof.html` | 唯一的 `main` 块与六个必须由主题提供的 partial 名称——所有主题共同遵守的契约，不放别的 |
| 基础主题 | `themes/hugo-docs-theme/` | 版式模板（首页 / 列表 / 单页 / 404）、partial（含 SEO 头、JSON-LD、落地页部件、搜索面板、面包屑）、`main.css`、`ui.css`、`syntax.css`、`scrollspy.js`、`site.js`、`robots.txt` |
| 中文叠加层 | `themes/hugo-docs-theme-zh/` | 只有 CJK 排版（`assets/css/cjk.css`）与 `[params.cjk] enabled` 开关 |

两个主题都由命令生成（`hugo new theme`），生成的示例模板、示例文章与示例菜单已删除。查找顺序为「项目 → 最左主题 → 次左」，`layouts`/`static`/`archetypes` **按文件级覆盖**（同路径文件是替换而非合并），`i18n`/`data` 才按键深度合并；主题配置只能设置 `params`、`menu`、`outputformats`、`mediatypes`。依据：<https://gohugo.io/hugo-modules/theme-components/>。

改动样式时据此选层：换配色改基础主题，换中文排版改叠加层，只有「所有主题都必须一致」的部分才写进项目层。

## 站点实现

- **左侧目录只展开当前章节**：`themes/hugo-docs-theme/layouts/partials/sidebar.html` 遍历 `site.Home.Sections.ByWeight` 列出全部一级章节，只对 `.CurrentSection` 与当前章节 `RelPermalink` 相等的那一个展开二级列表，因此 16 个章节同时出现时目录仍然紧凑。
- **右侧「本页目录」滚动高亮**：`partials/toc.html` 输出 `.TableOfContents`（层级由 `[markup.tableOfContents]` 限定为 h2–h3），`assets/js/scrollspy.js`（原生 JS、无依赖）在滚动时给当前标题对应的链接加 `.is-current`；判定阈值 = 顶部栏高度 + 20px，并把同一个值写进 `scroll-padding-top`，保证点击锚点后的落点与高亮一致。目录自身过长时会自动滚动以保持高亮项可见；窄屏下目录被 CSS 隐藏，脚本自动不生效。默认**不会**改写地址栏里的 `#锚点`。
- **首页只列每章前 6 个链接**：`layouts/index.html` 对每章输出「N 篇 · 前 6 个链接 · 查看全部 →」，页数超过 6 时才显示「查看全部」。
- **代码高亮**：`hugo.toml` 中 `markup.highlight.noClasses = false`，即输出 Chroma 类名而非内联样式，配色由 `assets/css/syntax.css` 决定。
- **资源管道**：`head.html` / `scripts.html` 用 `minify | fingerprint` 处理 CSS 与 JS，指纹文件名带 SRI 完整性校验；中文层的 `cjk.css` 由 `[params.cjk] enabled` 控制是否加载。
- **顶部导航**：`partials/header.html` 读取 `hugo.toml` 的 `[[menus.main]]`，目前为 首页 / 入门 / 内容管理 / 命令 / Hugo 官网；左侧目录则始终列出全部 16 章。
- **文档页里的真实示例**：短代码章节与渲染钩子章节把「真实产物」直接渲染在正文里（见下节「短代码」）。`main.css` 为此新增两组规则：`.doc-body .demo*`（演示框：标签条 + 舞台 + 说明），以及 `.doc-body figure` / `figcaption` / `iframe` / `details` —— 内置短代码展开出的元素**没有本站的类名**，只能按标签选，所以这组规则全部限定在 `.doc-body` 内，避免影响界面层。

## 短代码

### 内置短代码：文档里的写法，页面上能直接看到结果

Hugo 自带的一批短代码**不需要站点提供模板**就能调用。`/shortcodes/` 章节现在用它们做**真实演示**：每页的「示例」给出写法，紧随其后的「本站实际渲染效果」就在同一页上把结果渲染出来——图片是真的、折叠是真能点开的、二维码是真能扫的、播放器是真能播放的。

| 短代码 | 本站演示页 | 说明 |
| --- | --- | --- |
| `figure` | `/shortcodes/figure/` | 插图与图注；演示图用全局资源 `assets/images/examples/hugo-icon.png` |
| `details` | `/shortcodes/details/` | 折叠块，含 `open` 与 `name`（手风琴互斥） |
| `highlight` | `/shortcodes/highlight/` | 块级高亮与行内高亮（`hl_inline=true`） |
| `param` | `/shortcodes/param/` | 页面参数 → 站点参数的查找顺序 |
| `ref` / `relref` | `/shortcodes/ref/`、`/shortcodes/relref/` | 站内绝对 / 相对地址，含「单独成行」时自动链接的差别 |
| `qr` | `/shortcodes/qr/` | 构建时本地生成二维码 PNG（写入发布目录根） |
| `youtube` / `vimeo` / `instagram` | 各自页面 | 真实嵌入；只有访客浏览器才访问平台 |

> ⚠ **`x` 是唯一不在正文里调用的内置短代码**：它在构建时通过 `resources.GetRemote` 请求 `publish.x.com`，与本站「不依赖网络、断网也能构建」的约定冲突——拿不到数据时只打 WARNING，而本站的严格构建带 `--panicOnWarning`，这条警告会直接把构建判为失败。该页写明了原因与实测证据（普通构建退出码 0、加 `--panicOnWarning` 后为 2）。

### 本站自带的短代码

主题里有五个模板，都在 `themes/hugo-docs-theme/layouts/_shortcodes/`：

| 文件 | 用途 |
| --- | --- |
| `note.html` | 提示框：`{{</* note type="warning" title="标题" */>}}正文{{</* /note */>}}`；`type` = `note`（默认）/ `tip` / `warning` / `danger` |
| `banner.html` | 用图片管道在构建时拼贴首页横幅 |
| `quick-reference.html` | 速查页：`{{</* quick-reference section="functions" */>}}` 按命名空间列出页面 |
| `demo.html` | **示例演示框**：`{{</* demo label="…" note="…" */>}}…{{</* /demo */>}}`，把框内短代码的真实产物展示出来 |
| `wrap.html` | 只把内部内容包进 `<div>`，专用于演示两种记法的差别 |

`demo` 的三条写作约束，都是实测踩出来的：

- 框内**只放短代码调用或现成 HTML**，不放 Markdown 正文——框内是块级 HTML 容器（`<div class="demo-stage">`），里面的 Markdown 会被原始 HTML 块吞掉；
- 用**标准记法**调用：框内的子短代码先渲染、再交给 `demo`，所以嵌套是安全的；
- 要展示「Markdown 记法的效果」时**不要**套 `demo`——Markdown 记法的输出还要再过一遍 Markdown 渲染器，套进 HTML 块里就失效了；那种演示直接用 `wrap` 写在正文里（见 `/shortcodes/` 的「跑一遍」）。

### 记法与 `.Inner`（实测更正）

本站此前沿用了「Markdown 记法下 `.Inner` 已经是渲染好的 HTML」的说法，**实测不成立**（Hugo 0.167.0，Windows，最小站点）：

- 两种记法下 `.Inner` 都是**未渲染的原文**——把 `.Inner` 包进 `<pre>` 打印，`{{< >}}` 与 `{{% %}}` 的产物逐字相同；
- 真正的区别在**输出**：Markdown 记法的输出之后还会过一遍 Markdown 渲染器，标准记法不会。所以「看起来被渲染了」是输出层的事，不是 `.Inner` 的事；
- 由此推出的写法：标准记法下必须自己调 `markdownify` / `RenderString`，Markdown 记法下**不要**再调（会渲染两遍）；
- 站内活证据：`/shortcodes/` 的「跑一遍」一节用真实的 `wrap` 调用把两种记法的产物并排放在页面上，`/methods/shortcode/inner/` 一页也已更正。

其余约定：

- 新增短代码：在 `layouts/_shortcodes/` 放一个与调用名同名的 `.html`（子目录即命名空间，如 `media/audio.html` → `{{</* media/audio */>}}`），主题里的同名文件可被项目覆盖；
- 常用方法（`.Get`/`.Params`/`.IsNamedParams`/`.Inner`/`.InnerDeindent`/`.Parent`/`.Ordinal`/`.Page`…）、嵌套与渲染顺序、与 render hook 的分工，见 skill 的 `references/shortcodes.md`；
- 验证：`hugo --ignoreCache --printUnusedTemplates` 会列出没人调用的模板；调用未闭合或模板不存在都会让整站构建失败。

## 可运行示例（layouts 实现 + content 声明）

文档页上的「示例」不是贴在正文里的代码，而是**真跑一遍**：`/examples/` 一章给出总览与写法，参考页（`functions/`、`methods/`）上的示例面板上半是模板源码、下半是同一份模板执行出来的结果。

三层各司其职：

| 层 | 位置 | 管什么 |
| --- | --- | --- |
| 实现 | `themes/hugo-docs-theme/layouts/partials/examples/<命名空间>/<名字>.html` | 就是一个普通模板：调用函数、输出 HTML；上下文是 `dict "args" … "page" …` |
| 声明 | 内容页 front matter 的 `[[params.examples]]` | `id`（=模板路径）、`title`（面板标题）、`args`（传给模板的输入）、`note`（可选说明） |
| 放置 | 正文里一行 `{{</* examples */>}}`（`id="…"` 可只放一个） | 决定示例出现在哪一节 |

渲染由 `partials/example-panel.html` 负责：用 `os.ReadFile` 读出模板源码交给 `transform.Highlight` 高亮，再用 `partial` **执行同一个文件**——所以**源码与产物不可能漂移**，示例写错时构建直接失败。

两个出口同源：Markdown 版本（任意页面 URL 后接 `index.md`）由 `partials/examples-md.html` 从同一份声明生成，带上模板源码与实际输出；`/examples/` 的索引由 `partials/examples-index.html` 与 `partials/examples-index-md.html` 分别产出 HTML 与 Markdown。

新增一个示例的最小步骤：写模板 → 在页面 front matter 里声明 → 正文放一行短代码（`/examples/` 一页有完整说明）。

## SEO

`partials/head.html` 输出：唯一 `<title>`、`<meta name="description">`（页面 `description` → `.Summary` → 站点默认，`plainify` 后截断 160 字）、绝对 `<link rel="canonical">`、`og:*` 与 `twitter:card`、多语言 `hreflang`（仅当站点确有多种语言时）、RSS 替代链接与 `theme-color`；`partials/schema.html` 输出 JSON-LD（页面 `TechArticle`，首页 `WebSite`）。

- **抓取控制**：`hugo server`（development）输出 `noindex, nofollow`，正式构建（production）输出 `index, follow`，预览环境不会被误索引；单页可用 front matter 的 `noindex = true` 覆盖。
- **`robots.txt` 与站点地图**：`enableRobotsTXT = true` 加上主题中的 `layouts/robots.txt`——正式环境才 `Allow: /` 并附 `Sitemap:` 绝对地址；`sitemap.xml` 由 Hugo 按 `[sitemap]` 配置生成。
- **结构化数据的坑**：在 `<script type="application/ld+json">` 里写 `{{ $data | jsonify }}`，Go 会把已序列化的字符串当 JS 字符串字面量再编码一次，输出成 `"{…}"`，结构化数据随即失效。正确做法是把**对象**交给模板（`{{ $data }}`），让 JS 上下文做净化序列化；依据 <https://gohugo.io/functions/safe/js/>。
- **验证方式**：构建后从 `public/index.html` 取出 JSON-LD 交给真正的 JSON 解析器解析一遍——标签存在不等于数据可用。

### 发布后主动提交（IndexNow）

`robots.txt` 与 `sitemap.xml` 只解决「允许抓取」和「列出 URL」，不解决「多快被发现」。本站用 IndexNow 主动推送：

- **归属证明**：`static/<key>.txt`，文件内容就是 key 本身。构建后发布到站点根（`https://hugozh.cn/<key>.txt`），IndexNow 靠它验证域名归属；key 为 8–128 位，只允许 `a-z A-Z 0-9 -`。
- **提交脚本**：`npm run indexnow`（即 [`.deploy/indexnow.mjs`](.deploy/indexnow.mjs)）。它自动在 `static/` 里发现 key 文件、读 `public/sitemap.xml`，按官方上限每批 ≤10,000 条 POST 到 `api.indexnow.org`；`--dry-run` 只看不发，`--limit N` 小批量试跑，`--endpoint` 可换成 bing/yandex 等单家端点。
- **协议依据**：<https://www.indexnow.org/documentation>（请求格式、返回码）与 <https://www.indexnow.org/faq>（官方明确：**整站新上线或迁移时可以一次性提交全部 URL**，日常则只提交有实际改动的 URL，同一 URL 不要反复提交）。
- **站长平台归属验证**：走 `hugo.toml` 的 `[params.verification]`——填 Google / Bing 给的 content 值即输出对应 meta 标签；若用「HTML 文件」方式，把平台下载的文件直接放进 `static/` 即可，不必改模板（两项都留空时零输出）。

## 版本控制与日期

站点源码由 Git 管理（仓库根就是站点根；`.agents/skills/`、`.translation/`、`.testing/`、`.deploy/` 也在同一仓库内）。产出物不入库：

```gitignore
public/
resources/
.hugo_build.lock
hugo_stats.json
```

`.gitattributes` 里 `* text=auto eol=lf` 统一换行符，避免跨平台整文件 diff。

**让 Hugo 回读仓库**（`hugo.toml`）：

```toml
enableGitInfo = true

[frontmatter]
  lastmod = [':git', 'lastmod', 'date']   # 优先取提交时间
```

于是每个页面都有 `.GitInfo`，正文页元信息会显示「提交 51660c8」（悬停可见提交说明与作者），**每次提交后各页「最后更新」自动前进**，不依赖手写日期。

**日期呈现**（`partials/time.html`）：本地化长日期 + 相对时间，并始终包在语义化的 `<time datetime="ISO8601">` 中——「发布于 2026年10月1日（今天）· 最后更新 2026年10月1日（今天）· 提交 51660c8」。

```html
<time datetime="2026-10-01T00:00:00+08:00" title="2026年10月1日">2026年10月1日</time>
```

一个实测结论：Hugo 的本地化 token（`:date_long` 等）**对中文会回退成英文**（同一模板下 `locale = "de-DE"` 输出 `1. Oktober 2026`，`locale = "zh-CN"` 输出 `October 1, 2026`）。因此中文格式由**中文叠加主题**显式给出：`[params] dateFormat = "2006年1月2日"`（放在 `[params.cjk]` **之前**——TOML 中表头之后的键会归入该表）。相关坑见 skill 的 G21/G22。

## 多语言（当前未启用）

本站只发布简体中文，因此没有 `[languages]` 配置、也没有 `i18n/` 目录——单语言站点只需要 `locale` 用于日期与数字格式化。将来若要加英文：按**文件名**翻译（`about.md` + `about.en.md`，同路径同名即自动配对；无法同名时用 front matter 的 `translationKey`）或按**语言分目录**（`[languages.en] contentDir = 'content/en'`，二者不可混用），并同步 `label` / `locale` / `direction`（0.158 起分别取代 `languageName` / `languageCode` / `languageDirection`）。切换器、`T` 字符串表、缺翻译占位符与验证方式见 skill 的 `references/i18n.md`。

## 调整外观

- **颜色、栏宽、字体**：改 `themes/hugo-docs-theme/assets/css/main.css` 顶部的 `:root` 自定义属性（`--accent`、`--bg`、`--sidebar-width`、`--toc-width`、`--content-max` 等），改这一处即可整体换配色。
- **中文排版**：改 `themes/hugo-docs-theme-zh/assets/css/cjk.css`（字体栈、行距、两端对齐、断行规则）。
- **深色模式**：没有手动开关，`main.css` 中的 `@media (prefers-color-scheme: dark)` 会**跟随系统**；要固定为浅色，删掉该媒体查询即可。
- **代码高亮配色**：改 `themes/hugo-docs-theme/assets/css/syntax.css`。
- **顶部导航**：增删 `hugo.toml` 中的 `[[menus.main]]` 条目。
- **页脚说明**：改 `themes/hugo-docs-theme/layouts/partials/footer.html`。

## 新增页面

```bash
hugo new content <章节>/<页面>.md     # 例如 hugo new content getting-started/my-page.md
```

- 新页面会套用 `archetypes/default.md`，请填写 `title` / `linkTitle` / `description` / `source`，并按需调整 `weight`（越小越靠前）。
- 只要文件放在对应章节目录下，**无需改任何模板**：左侧目录、首页链接、上一篇 / 下一篇都会自动带上它。
- 新增章节：在 `content/` 下新建目录并添加 `_index.md` 与若干页面，侧栏与首页会自动出现该章节。
- 注意 Hugo 0.158+ 已用 `hugo new project` 取代 `hugo new site`（本站不是通过该命令创建的，此处仅作版本提示）。

## 范围与已知偏差

本站以「覆盖上游全部一级章节、1:1 对应」为目标，目前**已完成 16 个一级章节**，但以下部分**尚未翻译**，因此还不是完整的中文镜像：

| 未翻译部分 | 上游规模（约） | 说明 |
| --- | --- | --- |
| `functions/` | 约 200 页 | 函数参考（`Page`、`Site`、`Collections`、`Math`、`Strings`、`Time` 等命名空间的全部函数） |
| `methods/` | 约 100 页 | 方法参考（`Page`、`Resource`、`Menu` 等对象的方法） |
| `quick-reference/glossary/` | 约 160 条 | 术语表条目（本站 `quick-reference/` 仅有 3 页） |
| `news/` | — | 官方博客 / 发布说明 |
| `_common/` | — | 供其他页面 `include` 的文档片段（非独立页面） |

其他如实说明：

- `about/license.md` 是 Apache License 2.0 的**逐节转述**（按小节归纳许可条款要点），**不是法律全文的逐字翻译**；涉及权利与义务时请以官方仓库中的 `LICENSE` 文件与 <https://gohugo.io/about/license/> 为准。
- 部分页面上游的**默认值由 `code-toggle` 等数据块提供**（例如 `configuration/server.md` 中开发服务器的默认请求头与重定向规则）。本站未逐字列出全部默认值，而是以文字说明为主，需要精确默认值时请看该页 `source` 指向的官网页面。
- 各页 `weight` 用于站内排序，与上游文档的排列顺序**不保证逐条一致**。
- 译文以对上游英文原文的翻译为主，个别表格、示例与措辞做了适应中文阅读的调整。

## 验证状态

- 本项目的文件由本工作区生成，**生成环境无法运行命令行、也无法访问 gohugo.io**；因此构建验证依赖使用者在本地执行 `hugo server`（Hugo 0.147+）。
- 已知的一处历史问题已修复：`hugo.toml` 中的 `languageCode` 自 Hugo 0.158.0 起弃用，已改为 `locale`；同时模板把 `site.Language.Locale` 换成 `[params] htmlLang`，因此本站可在 **0.147 起**构建（EdgeOne Pages 等平台默认提供的就是 0.147.5）。
- 另一处已修复的问题：内容中曾出现**未转义的短代码定界符**（写在行内代码里也会触发），导致整站构建失败；现已全部改用 `{{</* … */>}}` / `{{%/* … */%}}` 转义写法（详见上文「短代码注意事项」）。
- 构建产物中会包含 Hugo 默认分类法生成的 `tags/`、`categories/` 空页面（本站内容未使用分类法）。如需彻底去掉，在 `hugo.toml` 中加入 `disableKinds = ["taxonomy", "term"]` 即可。
- 译文中的**个别默认值与版本号请以 `source` 指向的官网页面为准**。

## 版权与免责

- 原文版权归 Hugo 项目及其文档贡献者所有，原文仓库：<https://github.com/gohugoio/hugoDocs>。
- 许可分两块：译文（`content/`）为 [Apache-2.0](LICENSE-APACHE)（演绎自上游文档），本站的模板、样式、脚本与技能包为 [MIT](LICENSE)，署名见 [NOTICE](NOTICE)。
- 本站仅包含中文译文，以及为展示译文而编写的模板、样式与脚本，仅供学习交流，**不能替代官方文档**；如有歧义，一切以官方英文原文为准。
- 如官方文档的许可条款有更新，请以官方仓库中的许可文件为准，并据此调整本站的使用与再分发方式。

## Git 集成与「无 Git 环境」构建

站点开启了 `enableGitInfo = true`，并让 `lastmod` 优先取该文件最后一次提交的日期
（配置见 `hugo.toml`；官方说明：<https://gohugo.io/methods/page/gitinfo/>、<https://gohugo.io/configuration/all/#enablegitinfo>）：

```toml
enableGitInfo = true
[frontmatter]
  lastmod = [':git', 'lastmod', 'modified', 'date']
```

页面底部因此会显示「最后更新」与短提交号（模板里用 `{{ with .GitInfo }}` 保护，即使为空也不会报错）。

**实测（observed，非文档记载）**：如果构建目录里**没有 `.git`**，Hugo 会**整站构建失败**，而不是降级：

```
failed to create page from pageMetaSource : "content/_index.md:1:1":
failed to load Git data: fatal: not a git repository (or any of the parent directories): .git
```

因此凡是「只上传源码、不带 Git」的部署方式，请加兜底配置 `hugo.nogit.toml`（关闭 Git 信息、去掉 `:git` 回退链）：

```bash
hugo --minify                                              # 目录里有 .git
hugo --minify --config hugo.toml,hugo.nogit.toml           # 没有 .git
# 平台构建命令可写成（仓库根目录即站点根，不要再 cd 进子目录）：
# if [ -d .git ]; then hugo --minify; else hugo --minify --config hugo.toml,hugo.nogit.toml; fi
```

另注：若平台做的是**浅克隆**（`--depth 1`），构建不会失败，但所有页面的「最后更新」都会等于那一次提交的日期（信息失真，不影响构建）。

## 界面层：落地页、搜索、导航与阅读体验

这一层放在 `assets/css/ui.css` 与 `assets/js/site.js`（都由 `head.html` / `scripts.html` 经资源管道 minify + fingerprint 引入），不与 `main.css` 的版式规则混写。全部使用 `main.css` 的令牌，深浅色自动跟随。

### 落地页（`layouts/index.html`）

按**任务**分流，而不是按章节罗列——读者先回答「我想做什么」，再进入正文。

| 区块 | 数据来源 | 说明 |
| --- | --- | --- |
| Hero（标题、三个主按钮、统计） | `[params]` + 实时统计 | 页数、章节数、教学说明页数都是**构建时算出来的**，不写死 |
| 你想做什么（8 张任务卡） | `[[params.home.cards]]` | 想改内容只动 `hugo.toml`，不用碰模板 |
| 常用入口（胶囊） | `[[params.home.quickLinks]]` | 站内被引用最多的函数/命令/速查页 |
| 全部章节（含条目数） | `site.Home.Sections.ByWeight` | 页数用 `len .Pages`，与章节列表页列出的条目一致 |

> **统计口径的坑（实测）**：`len .RegularPagesRecursive` 会把正文页在 `site.RegularPages` 里已算过一次的量再累加，得出双倍数（曾出现 1788 这种明显偏大的值）；`site.Sections` 又只给一级章节，会漏掉 `functions/strings`、`methods/page` 这类二级 `_index.md`。正确写法是 `len site.RegularPages` + `where site.Pages "Kind" "section"`。

### 搜索（纯静态，无后端）

- 索引：首页额外产出 `/search.json`（output format `searchindex`），884 条、约 150 KB，字段只有 `t`（标题，含签名）、`u`（链接）、`s`（章节）、`d`（摘要）、`q`（是否为限定名）；
- 加载：**首次打开搜索框时才拉取**，不进首屏关键路径；入口有按钮、`Ctrl/⌘+K`、`/` 三种；
- 匹配：中文没有词边界，统一走「小写 + 去空格 + 子串」，因此中文可直接输入；
- 排序（改动时请同步 `.testing/search-check.mjs`，它用同一组向量盯着实现）：
  标题完全匹配 `100` → 以查询开头 `80` → **限定名的最后一段以查询开头** `78` → 含查询 `60` → 章节 `22` → 摘要 `18`；限定名（标题含 `.`）额外 +10。

  最后一段那条规则是实测踩出来的：读者搜 `truncate`，而模板里写的是 `strings.Truncate`——只看整串前缀时，`Truncate DURATION1.…` 这类裸方法名会以 80 分压过它（它整串以 `strings.` 开头，只能拿子串分）。

### 导航与阅读体验

| 功能 | 位置 | 说明 |
| --- | --- | --- |
| 移动端抽屉 | `partials/sidebar.html` + `ui.css` | ≤860px 时侧栏变为浮层，带遮罩、Esc 关闭、点链接自动收起 |
| 章节下拉 | `partials/header.html` | 列出全部一级章节与条目数，点外部或 Esc 收起（`<details>` 原生不响应这两件事，由 JS 补） |
| 面包屑 | `partials/breadcrumbs.html` | home → 各级 section → 当前页；首页与 404 不渲染 |
| 本页目录 | `partials/toc.html` + `scrollspy.js` | 既有实现，滚动高亮 |
| 深色模式开关 | `header.html` + `head.html` 内联脚本 | 三态：未选跟随系统、手选深浅写 `localStorage`；内联脚本先于样式执行，避免刷新闪白 |
| 阅读进度 / 返回顶部 | `baseof.html` + `site.js` | 滚动驱动，`prefers-reduced-motion` 时不做平滑动画 |
| 标题锚点 | `site.js` 注入 | 悬停显示 `#`，点击复制带锚点的完整地址 |
| 代码块复制 | `_markup/render-codeblock.html` + `site.js` | 渲染钩子统一包 `.code-block` 并给出语言标签与按钮位，按钮由 JS 注入（无 JS 时退化为普通代码块） |

### 怎么验证这一层

```powershell
# 1) 起本地服务（回归脚本约定端口 1515；在仓库根目录执行）
hugo server --port 1515 --noBuildLock

# 2) 端到端 UI 检查：搜索、主题、抽屉、复制、锚点、进度、落地页、移动端溢出
node .testing/ui-check.mjs        # 30 项断言

# 3) 搜索排序（不需要浏览器，只读 search.json）
node .testing/search-check.mjs    # 14 条查询向量 + 4 项排序

# 4) 侧栏激活态回归
node .testing/sidebar-check.mjs   # 6 个层级 + 点击跳转后保持高亮

# 5) 文档页里的「真实示例」回归
node .testing/demo-check.mjs      # 演示框、二维码、折叠交互、两种记法、渲染钩子产物、窄屏不溢出
```

`ui-check.mjs` 会断言「窄屏不横向溢出」「搜索框不超出视口」这类**会被真实用户看到**的问题，而不只是「DOM 里有没有这个类」。它还会收集控制台错误——本轮就是靠它发现 `hugo.OS` 字段不存在导致的模板报错。

`demo-check.mjs` 专门盯文档页里那些**真元素**：演示框有没有真的渲染出来、`figure` 的图有没有真的加载（看 `naturalWidth`，不是看有没有 `<img>`）、`details` 点了会不会展开、二维码是不是真图、iframe 指向的平台对不对、`{{% wrap %}}` 那一段有没有落出真标题、窄屏会不会被二维码/播放器撑破。第三方嵌入（YouTube / Vimeo / Instagram）在断网环境必然产生网络错误，脚本已把那类错误排除，只保留页面级 JS 报错。

> ⚠ **审计 `public/` 之前先做一次干净的生产构建，并停掉 `hugo server`。** 实测（Hugo 0.167.0）：`hugo server` 会把**注入 livereload 脚本的 HTML 写回 `public/`**，此时跑 `.translation/audit-links-case.ps1` 会报出 `/livereload.js` 这类「死链」——它们只存在于开发服务器的产物里。顺序应当是：关掉 server → `hugo --ignoreCache --cleanDestinationDir` → 再审计（`accept.ps1` 里的顺序正是如此）。

### 本轮踩到的两个 CSS/模板坑（已修，留档）

1. **媒体查询顺序**：`.drawer-head { display: none }` 原本写在 `@media (max-width: 860px)` **之后**，同为单类选择器时后写者胜，把窄屏的 `display: flex` 覆盖掉——现象是抽屉能打开、关闭按钮却点不到。规则现在明确放在媒体查询之前，并在文件里留了注释。
2. **`hugo.OS` 不存在**：模板里没有这个字段（`hugo.Info` 不含 OS），写它会整站渲染失败。快捷键提示改成跨平台的 `Ctrl/⌘ K`。

## 教学层（本站在直译之外增加的一层）

上游文档刻意克制：默认读者懂命令行、能自己补齐上下文、遇到报错会自己查。本站要补的正是这一层——**让没有 AI 辅助的普通读者也能照着做完**。做法是「正文增补 + 可选的前置元数据教学块」，不另起一套页面。

### 数据契约：`[params.teach]`

```toml
+++
title = "快速开始"
linkTitle = "快速开始"
description = "手把手从零跑通第一个 Hugo 站点…"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/getting-started/quick-start/"

[params.teach]
difficulty = "入门"                 # 入门 / 进阶 / 参考
time = "15–20 分钟"                 # 字符串；写成纯数字会被 TOML 解析成整数/Epoch
prereq = ["…"]                      # 开始之前需要具备什么（支持行内 Markdown）
outcomes = ["…"]                    # 读完之后能做到什么
next = ["/installation/"]           # 接着读（站内根相对路径）
+++
```

> ⚠ **六个标量字段必须写在所有表头之前**。`[table]` 之后的裸键会归入该表：把 `source` 写在 `[params.teach]` 后面，它就变成 `params.teach.source`——页脚不再有原文链接，而 **Hugo 不会报错**。这与 README 前文提到的 `theme` 被吞进 `[frontmatter]` 是同一类坑。

### 渲染：两个出口、一份数据

| 出口 | 模板 | 位置 |
| --- | --- | --- |
| HTML 面板（给人看） | `themes/hugo-docs-theme/layouts/partials/teach-box.html` | `single.html` 中 `function-meta` 之后、`.doc-body` **之前** |
| Markdown 引用块（给机器看） | `themes/hugo-docs-theme/layouts/partials/teach-md.html` | `single.md.md` 中摘要之后 |

两个 partial 都读 `.Params.teach`，所以**人类与机器看到的是同一份事实**，不会分叉。面板位于 `.doc-body` 之外，只抽 `.doc-body` 的抓取器会漏掉它——这条已写进 `/llms.txt` 的抓取建议。样式在 `main.css` 的 `.teach` 一组，用主题既有的 `--bg-soft` / `--border-soft` / `--brand` 变量，深色模式自动生效。

### 正文增补的口径（只增不删）

| 页面角色 | 增补要求 |
| --- | --- |
| 教程 / 上手（`getting-started`、`installation`） | 目标、前置、分步、每步验证标准、常见坑表、下一步 |
| 流程型章节（`templates`、`render-hooks`、`hugo-pipes`） | 每小节说明「在解决什么问题」+ 最小可运行示例 + 结果长什么样 |
| 参考页（`functions`、`methods`、`commands`） | 忠实翻译为主，补「什么时候用 / 别用」与返回值边界 |
| 术语 / 速查（`quick-reference`） | 保持条目化，不扩写 |

三条硬要求：上游的技术细节一行都不能丢；上游没写、由本站实测得到的结论必须标「实测」；站内链接一律根相对**且全小写**（Hugo 输出 URL 小写，写驼峰会产生死链）。

范例：`content/getting-started/quick-start.md`（Windows PowerShell 编码坑那一节就是「上游只给结论、本站给出原因与后果」的典型）。

### 覆盖度审计

```powershell
pwsh -NoProfile -File .translation/audit-teach.ps1                  # 全站概览 + 按章节明细
pwsh -NoProfile -File .translation/audit-teach.ps1 -Strict          # 教程章节缺教学块即失败
pwsh -NoProfile -File .translation/audit-teach.ps1 -Section getting-started
```

只读、幂等。教程章节（`getting-started` / `installation` / `troubleshooting`）按严格口径要求覆盖。

### 现状与推进顺序

教学层按「学习成本」排序推进，不追求一次覆盖全站。当前状态：

| 状态 | 范围 | 说明 |
| --- | --- | --- |
| 已完成（教程/流程/内容型） | `getting-started`、`installation`、`templates`、`render-hooks`、`hugo-pipes`、`troubleshooting`、`shortcodes`、`content-management`、`configuration`、`host-and-deploy`、`hugo-modules`、`tools`、`about`、`contribute`、`news`、`skill` | 逐页改写为教学版，并加 `[params.teach]` 教学块；全部章节首页已覆盖 |
| 已完成（参考页） | `functions`（313 页）、`methods`（268 页） | 上游多为几行自动生成的骨架，已逐页补「这一页解决什么问题 / 什么时候用与别用 / 完整示例 + 实测输出 + 返回值边界」；全部命名空间首页补了「怎么找函数」「三种角色」「这里的坑」等导读 |
| 已完成（术语表） | `quick-reference/glossary`（158 条） | 保持条目形态，每条补「为什么重要」与延伸阅读；教学块给出机器可读的相关主线页 |
| 有意保持精简 | `quick-reference` 的速查页、`news` 索引等 | 速查类内容按 BRIEF 4.2.1 只做索引，不扩写 |

参考页的写法见 `functions/collections/Where.md`、`functions/urls/RelURL.md`（函数）与 `methods/page/Summary.md`、`methods/site/Param.md`（方法）。
改完一页跑一次 `audit-teach.ps1 -List` 就能看到该页是否已计入。

### 参考页的实测门槛（重要）

参考页的示例**必须真跑过再写**，这是本层最容易失守的一环——凭签名推断输出会写出看起来合理但错误的断言。做法：

```powershell
# 1) 在系统临时目录建最小站点：hugo.toml 写 baseURL；content/ 放几页内容；layouts/ 放模板
# 2) 把文档里的示例原样搬进模板，构建并读产物
hugo --source <临时目录> --ignoreCache
```

- **`--source` 不能漏**：在工作区根不带 `--source` 跑 `hugo` 会构建一个**空站点**并返回 `exit=0`——这是假阳性，不能作为验证证据（BRIEF 第五节）；
- 需要 fixture 的页面（`assets/` 下的图片、`i18n/` 表、多语言配置）要在报告里说明，不能只写「输出如下」；
- 跑不出来的（需要联网等）就写「上游未说明」，**不要臆造**。

## 面向 AI 代理的输出（SEO / GEO）

站点不只给人看，也给 AI 代理与答案引擎看。**同一份正文**派生出下列机器可读资源：

| 资源 | 路径 | 说明 |
| --- | --- | --- |
| **LLM 入口文件** | `/llms.txt` | 站点摘要 + 页面角色说明 + 分主题入口 + 机器可读资源清单 + 抓取建议 + 内容约定（约定见 <https://llmstxt.org/>） |
| **每页 Markdown** | 任意页面 URL 后接 `index.md` | 例如 `/functions/strings/chomp/index.md`：头部给出官方原文、规范地址、最近更新、最后提交、**函数签名与返回类型**，随后是该页 Markdown 原文；有教学块的页面还会带上「教学信息」引用块 |
| **全站页面清单** | `/pages.json` | 约 950 条，每条含 url / markdown / kind / title / description / section / sectionTitle / source / lastmod / **role** / difficulty / time / hasTeach / prereqCount / outcomeCount / hasSignature（约 460 KB，gzip 后约 50 KB） |
| **搜索索引** | `/search.json` | 884 条，字段 `t`/`u`/`s`/`d`/`q`（约 150 KB）；供本站客户端搜索按需拉取，也可被代理直接用来做检索 |
| **发现链** | HTML `<head>` | `<link rel="alternate" type="text/markdown" href="…/index.md">`，代理无需猜路径 |

`pages.json` 里的 `role` 是「这一页该怎么用」的机器可读判断：`tutorial`（上手教程，按步骤执行）/ `guide`（流程指南，取示例）/ `reference`（查签名与边界）/ `query`（术语速查）/ `index`（章节首页）。`difficulty` / `time` / `hasTeach` 与 HTML 教学面板**同源**，代理据此决定是先读这一页还是直接查阅。

配置（`hugo.toml`）与模板（`themes/hugo-docs-theme/layouts/{_default/single.md.md,_default/list.md.md,index.md.md,index.llms.txt,index.pagesjson.json,index.searchindex.json}`）都基于官方 output format 机制：

```toml
[mediaTypes.'text/markdown']
  suffixes = ['md']

[outputFormats.md]
  mediaType   = 'text/markdown'
  baseName    = 'index'
  isPlainText = true      # 用 text/template 解析，避免 Markdown 被 HTML 转义
  isHTML      = false

[outputFormats.pagesjson]
  mediaType   = 'application/json'
  baseName    = 'pages'
  isPlainText = true      # 纯 JSON 输出，不在 <script> 里，用 jsonify 是正确的
  isHTML      = false
  notAlternative = true

[outputs]
  home    = ['html', 'rss', 'llms', 'md', 'pagesjson', 'searchindex']
  section = ['html', 'rss', 'md']
  page    = ['html', 'md']
```

要点与坑：

- 模板命名遵循 `[page kind].[output format].[suffix]`，因此是 `single.md.md` / `list.md.md` / `index.llms.txt` / `index.pagesjson.json` / `index.searchindex.json`（依据：<https://gohugo.io/configuration/output-formats/#template-lookup-order>）。
- `isPlainText = true` 是关键：否则 Markdown 正文会被 `html/template` 转义成实体。
- 页面模板会**剥离独占一行的短代码定界符**（`{{</* note */>}}` … `{{</* /note */>}}`），保留其内部内容，避免代理拿到未解析的标记。
- `(dict …)` 多行写法必须**显式闭合右括号**，否则整个模板解析失败、构建直接报错（`unexpected <with> in parenthesized pipeline` 之类的报错很容易被误读成函数用错）。
- **人类出口与机器出口必须同源**：教学信息由 `teach-box.html`（HTML）与 `teach-md.html`（Markdown）两个 partial 读同一份 `.Params.teach`，改一处就两边都变。只在其中一个模板里加东西，人机看到的内容就会悄悄分叉。
- 新增输出会让构建设置的「页面数」翻倍（约 950 个内容文件 → **1966** 页），这是正常的：它是「页面数 × 输出格式数」，不是内容变多。
- `robots.txt` 显式允许主流 AI 抓取器（GPTBot、ClaudeBot、PerplexityBot、Google-Extended 等）并保留 `Sitemap:` 行。

## 技能包

`hugo-static-site` 是给 AI 编码代理用的作业手册：铁律（哪些改动会让**整站**构建失败）、G1–G28 症状→真因→修法、SEO 清单、短代码撰写（含「在文档页里展示短代码真实产物」的写法）、日期与多语言、版本控制与 Git 联动日期。**不是代码，是 Markdown**，不用 DSH 也能当文档读。

源码在 [`.agents/skills/hugo-static-site/`](.agents/skills/hugo-static-site/)（SKILL.md + 10 篇 references + 安装提示词），站内介绍页在 <https://hugozh.cn/skill/>，机器可读清单是 `/skill/skill-manifest.json`。装到哪儿由你所用代理的约定决定，两种常见落法：

```text
1) <你的项目>/.agents/skills/hugo-static-site/   # 随项目走
2) ~/.agents/skills/hugo-static-site/            # 全机器可用
```

技能包自带的 INSTALL-PROMPT 刻意**不写死任何产品路径**：不同代理的技能目录与加载机制不同，装到哪儿、怎么加载交给代理按自己的约定判断（详见站内 `/skill/` 一页）。

改了技能包之后跑 `pwsh -File .translation/sync-skill-static.ps1` 同步到 `static/skill/` 并重新生成清单；加 `-Verify` 只校验镜像与源是否一致（CI/验收用）。

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。最欢迎的两类：**可复现的踩坑**（附 `hugo version` 与最小例子），以及**译文的修正**（请一并给出上游原文链接）。