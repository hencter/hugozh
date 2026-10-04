// 本轮「文档页里的真实示例」端到端检查：内置短代码演示框、二维码、折叠交互、
// 两种记法的真实产物、渲染钩子的产物，以及窄屏不溢出。
// 断言的是「读者能不能看到/用到」，不是「DOM 里有没有这个类」。
// 用法：先起本地服务（hugo server --port 1515 --noBuildLock），再 node .testing/demo-check.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:1515";
let problems = 0;
const shot = (page, name) => page.screenshot({ path: `.testing/demo-${name}.png`, fullPage: false }).catch(() => {});
const check = (label, ok, extra = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${ok ? "" : "  " + extra}`);
  if (!ok) problems++;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  // 第三方嵌入（YouTube / Vimeo / Instagram）在无网或内网环境必然报网络错误，不算页面缺陷
  const t = m.text();
  if (m.type() === "error" && !/youtube|vimeo|instagram|ERR_|Failed to load resource/i.test(t)) errors.push(t);
});

console.log("── shortcodes：演示框与真实产物 ──────────────────");
for (const [name, minDemos] of [["figure", 2], ["details", 3], ["highlight", 2], ["param", 3], ["qr", 3], ["youtube", 2], ["vimeo", 2], ["instagram", 1]]) {
  await page.goto(`${BASE}/shortcodes/${name}/`, { waitUntil: "domcontentloaded" });
  const demos = await page.locator(".demo").count();
  const box = demos ? await page.locator(".demo").first().boundingBox() : null;
  check(`/shortcodes/${name}/ 演示框 ≥ ${minDemos} 且可见`, demos >= minDemos && !!box && box.height > 20, `实际 ${demos} 个，高度 ${box ? Math.round(box.height) : "?"}`);
}

// figure：演示图片真的加载出来了
await page.goto(`${BASE}/shortcodes/figure/`, { waitUntil: "load" });
const imgOk = await page.evaluate(() => {
  const img = document.querySelector(".demo img");
  return img ? { src: img.getAttribute("src"), w: img.naturalWidth, cap: !!img.closest("figure")?.querySelector("figcaption") } : null;
});
check("figure 演示图真的加载出来了", !!imgOk && imgOk.w > 0, JSON.stringify(imgOk));
check("figure 演示带图注（figcaption）", !!imgOk?.cap);
await shot(page, "figure");

// details：能点开，且 open=true 的那个初始就是展开的
await page.goto(`${BASE}/shortcodes/details/`, { waitUntil: "load" });
const states = await page.$$eval(".demo details", (ds) => ds.map((d) => d.open));
check("details 演示：四个折叠块（两个单例 + 一组手风琴）", states.length === 4, JSON.stringify(states));
check("details 演示：第二个是 open=true 的", states[1] === true && states.filter(Boolean).length === 1, JSON.stringify(states));
await page.locator(".demo details").first().locator("summary").click();
const opened = await page.$$eval(".demo details", (ds) => ds.map((d) => d.open));
check("details 演示：点击摘要后真的展开", opened[0] === true, JSON.stringify(opened));
await shot(page, "details");

// qr：二维码是真图（离线也能扫）
await page.goto(`${BASE}/shortcodes/qr/`, { waitUntil: "load" });
const qr = await page.evaluate(() => [...document.querySelectorAll(".demo img")].map((i) => ({ src: i.getAttribute("src"), w: i.naturalWidth })));
check("qr 演示：三个二维码都加载成功", qr.length === 3 && qr.every((q) => q.w > 0), JSON.stringify(qr));
await shot(page, "qr");

// youtube/vimeo：iframe 真实存在且指向平台
for (const [name, host] of [["youtube", "youtube.com/embed/"], ["vimeo", "player.vimeo.com/video/"]]) {
  await page.goto(`${BASE}/shortcodes/${name}/`, { waitUntil: "domcontentloaded" });
  const srcs = await page.$$eval(".demo iframe", (fs) => fs.map((f) => f.getAttribute("src")));
  check(`${name} 演示：iframe 指向 ${host}`, srcs.length >= 1 && srcs.every((s) => (s || "").includes(host)), JSON.stringify(srcs));
}
await shot(page, "embeds");

console.log("\n── 可运行示例（layouts 执行 + content 声明）───────");
const examplePages = [
  ["/functions/strings/truncate/", "strings.Truncate"],
  ["/functions/collections/where/", "range where $books"],
  ["/functions/collections/uniq/", "collections.Sort"],
  ["/functions/collections/first/", "first 2"],
  ["/functions/cast/tostring/", "$hex := 0x11"],
  ["/functions/time/format/", "time.Format"],
  ["/functions/transform/markdownify/", "markdownify"],
  ["/functions/strings/replacere/", "replaceRE"],
  ["/methods/page/summary/", "site.GetPage"],
];
for (const [path, marker] of examplePages) {
  await page.goto(BASE + path, { waitUntil: "load" });
  const panel = await page.evaluate(() => {
    const el = document.querySelector(".example");
    if (!el) return null;
    const src = el.querySelector(".example-src pre");
    const stage = el.querySelector(".example-stage");
    return {
      title: el.querySelector(".example-title")?.textContent.trim() || "",
      src: src ? src.textContent : "",
      out: stage ? stage.textContent.trim() : "",
      srcH: src ? Math.round(src.getBoundingClientRect().height) : 0,
      outH: stage ? Math.round(stage.getBoundingClientRect().height) : 0,
    };
  });
  check(`${path} 有示例面板`, !!panel && panel.title.length > 0, JSON.stringify(panel && panel.title));
  check(`${path} 源码区显示的是模板本身`, !!panel && panel.src.includes(marker) && panel.srcH > 20, `含「${marker}」=${!!panel && panel.src.includes(marker)}`);
  check(`${path} 输出区非空（真跑出来的）`, !!panel && panel.out.length > 0 && panel.outH > 10, `输出长度 ${panel ? panel.out.length : 0}`);
}

await page.goto(`${BASE}/examples/`, { waitUntil: "load" });
const idx = await page.evaluate(() => ({
  stat: document.querySelector(".examples-stat")?.textContent.trim() || "",
  items: document.querySelectorAll(".examples-list li").length,
  groups: document.querySelectorAll(".examples-list").length,
  links: [...document.querySelectorAll(".examples-list a")].map((a) => a.getAttribute("href")),
}));
const n = parseInt((idx.stat.match(/共\s*(\d+)\s*个/) || [])[1] || "0", 10);
check("/examples/ 统计出示例总数", n >= 6, idx.stat.slice(0, 60));
check("/examples/ 按章节分组列出", idx.groups >= 1 && idx.items >= 6, JSON.stringify({ groups: idx.groups, items: idx.items }));
check("/examples/ 每个条目都链到真实页面", idx.links.length >= 6 && idx.links.every((h) => (h || "").startsWith("/")), JSON.stringify(idx.links.slice(0, 3)));
await shot(page, "examples-index");

// instagram：blockquote + embed.js 都在（脚本在无网环境不执行，只断言产物存在）
await page.goto(`${BASE}/shortcodes/instagram/`, { waitUntil: "domcontentloaded" });
const ig = await page.evaluate(() => ({
  blocks: document.querySelectorAll(".demo blockquote.instagram-media").length,
  script: !!document.querySelector('script[src*="instagram.com/embed.js"]'),
}));
check("instagram 演示：blockquote 与 embed.js 都在产物里", ig.blocks >= 1 && ig.script, JSON.stringify(ig));

console.log("\n── shortcodes/_index：两种记法的真实产物 ──────────");
await page.goto(`${BASE}/shortcodes/`, { waitUntil: "load" });
const wrap = await page.evaluate(() => {
  const wraps = [...document.querySelectorAll(".doc-body .wrap")];
  return wraps.map((w) => ({
    h3: w.querySelectorAll("h3").length,
    literal: /###\s*小标题/.test(w.textContent),
    strong: w.querySelectorAll("strong").length,
  }));
});
check("wrap 演示：两段产物都在页面上", wrap.length >= 2, JSON.stringify(wrap));
check("wrap 演示：Markdown 记法那段落出了真标题与粗体", wrap[0]?.h3 === 1 && wrap[0]?.strong === 1, JSON.stringify(wrap[0]));
check("wrap 演示：标准记法那段保留字面 Markdown", wrap[1]?.literal === true && wrap[1]?.h3 === 0, JSON.stringify(wrap[1]));
const demoBox = await page.locator(".demo").count();
check("短代码章节首页也有演示框", demoBox >= 1, `实际 ${demoBox}`);
await shot(page, "shortcodes-index");

console.log("\n── render-hooks：钩子的真实产物 ───────────────────");
await page.goto(`${BASE}/render-hooks/links/`, { waitUntil: "load" });
const linkAttrs = await page.evaluate(() => {
  const ext = [...document.querySelectorAll(".doc-body a")].find((a) => a.textContent.trim() === "Hugo 官网");
  const title = [...document.querySelectorAll(".doc-body a")].find((a) => a.textContent.trim() === "带 title 的链接");
  return { ext: ext ? { target: ext.target, rel: ext.rel } : null, title: title ? title.getAttribute("title") : null };
});
check("render-hooks/links：站外链接带 target/rel（本站钩子）", linkAttrs.ext?.target === "_blank" && /noopener/.test(linkAttrs.ext?.rel || ""), JSON.stringify(linkAttrs));
check("render-hooks/links：title 属性来自 .Title", linkAttrs.title === "图注文字", String(linkAttrs.title));

await page.goto(`${BASE}/render-hooks/code-blocks/`, { waitUntil: "load" });
const cb = await page.evaluate(() => ({
  blocks: document.querySelectorAll(".code-block").length,
  withFile: document.querySelectorAll(".code-block-file").length,
  langs: [...document.querySelectorAll(".code-lang")].map((s) => s.textContent.trim()),
}));
check("render-hooks/code-blocks：演示块真带文件名与语言标签", cb.withFile >= 1 && cb.langs.includes("go") && cb.langs.includes("html"), JSON.stringify(cb));

await page.goto(`${BASE}/render-hooks/blockquotes/`, { waitUntil: "load" });
const callouts = await page.$$eval(".callout", (cs) => cs.map((c) => c.className));
check("render-hooks/blockquotes：五个演示提示块都在",
  ["callout-note", "callout-tip", "callout-warning", "callout-caution", "callout-important"].every((k) => callouts.some((c) => c.includes(k))),
  JSON.stringify(callouts));

await page.goto(`${BASE}/render-hooks/images/`, { waitUntil: "load" });
const rimg = await page.evaluate(() => {
  const img = [...document.querySelectorAll(".doc-body img")].find((i) => (i.getAttribute("alt") || "").includes("示例图标"));
  return img ? { w: img.naturalWidth, title: img.title } : null;
});
check("render-hooks/images：演示图加载成功且有 title", !!rimg && rimg.w > 0 && rimg.title === "这是 title", JSON.stringify(rimg));

console.log("\n── 窄屏（390×844）不横向溢出 ─────────────────────");
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
for (const path of ["/shortcodes/", "/shortcodes/figure/", "/shortcodes/qr/", "/shortcodes/instagram/", "/shortcodes/youtube/"]) {
  await mob.goto(BASE + path, { waitUntil: "domcontentloaded" });
  const ok = await mob.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  check(`${path} 窄屏不横向溢出`, ok, await mob.evaluate(() => `${document.documentElement.scrollWidth} > ${window.innerWidth}`));
}
await mob.goto(`${BASE}/shortcodes/instagram/`, { waitUntil: "domcontentloaded" });
await shot(mob, "mobile-instagram");

console.log("\n── 控制台错误 ─────────────────────────────────────");
check("无页面级 JS 报错（第三方嵌入的网络错误已排除）", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(problems === 0 ? "\n全部通过 ✓" : `\n失败 ${problems} 项 ✗`);
process.exit(problems === 0 ? 0 : 1);
