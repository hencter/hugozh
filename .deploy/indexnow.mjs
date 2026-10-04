#!/usr/bin/env node
/**
 * IndexNow 提交：把 public/sitemap.xml 里的 URL 推给参与 IndexNow 的搜索引擎，
 * 让它们不必等自然爬取就发现新页面/改动。
 *
 * 协议依据（均为官方文档，逐条核对过）：
 *   · 文档：https://www.indexnow.org/documentation
 *     - key 为 8–128 位，只允许 a-z A-Z 0-9 与短横线；
 *     - 归属证明 = 站点根目录下放 `{key}.txt`，文件内容就是 key（UTF-8）；
 *     - 批量提交走 POST JSON：{ host, key, keyLocation?, urlList }，单次上限 10,000 条；
 *     - 返回码：200 成功 / 202 已接收待验证 / 400 格式错 / 403 key 无效 / 422 域名不匹配 / 429 限流。
 *   · FAQ：https://www.indexnow.org/faq
 *     - 走任一端点提交，结果会自动共享给其它参与引擎；
 *     - “整站刚上线或迁移”时可以一次性提交全部 URL；其余情况应只提交有实际改动的 URL；
 *     - 同一 URL 反复提交没有意义（建议间隔 5 分钟以上）。
 *
 * 本站当前属于「整站从未被收录」的引导场景，因此默认提交 sitemap 全量；
 * 日常更新请用 `--limit` 或先跑 `--dry-run` 确认范围。
 *
 * 用法：
 *   node .deploy/indexnow.mjs --dry-run          # 只打印将要提交的 URL，不发请求
 *   node .deploy/indexnow.mjs --limit 3          # 小批量试跑（验证 key 文件已部署）
 *   node .deploy/indexnow.mjs                    # 全量提交（默认端点为 api.indexnow.org）
 *   node .deploy/indexnow.mjs --endpoint https://www.bing.com/indexnow
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const endpointDefault = "https://api.indexnow.org/indexnow";
const BATCH_MAX = 10000; // 官方上限

function parseArgs(argv) {
  const opts = { dryRun: false, limit: Infinity, endpoint: endpointDefault, sitemap: join(ROOT, "public", "sitemap.xml") };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--limit") opts.limit = Number(argv[++i]);
    else if (a === "--endpoint") opts.endpoint = argv[++i];
    else if (a === "--sitemap") opts.sitemap = argv[++i];
    else if (a === "--help" || a === "-h") { console.log(readFileSync(new URL(import.meta.url), "utf8").split("*/")[0]); process.exit(0); }
    else { console.error(`未知参数：${a}（用 --help 看用法）`); process.exit(2); }
  }
  return opts;
}

/** 在 static/ 里自动发现 IndexNow key：文件名是 key，文件内容也是同一个 key。 */
function findKey() {
  const dir = join(ROOT, "static");
  if (!existsSync(dir)) throw new Error(`找不到 ${dir}`);
  const hits = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".txt")) continue;
    const stem = name.slice(0, -4);
    if (!/^[A-Za-z0-9-]{8,128}$/.test(stem)) continue;
    const body = readFileSync(join(dir, name), "utf8").trim();
    if (body === stem) hits.push({ key: stem, file: join("static", name) });
  }
  if (hits.length === 0) throw new Error("static/ 下没有找到合法的 IndexNow key 文件（{key}.txt，内容等于文件名）");
  if (hits.length > 1) throw new Error(`static/ 下有多个 key 文件，无法确定用哪个：${hits.map((h) => h.file).join(", ")}`);
  return hits[0];
}

function readSitemapUrls(file) {
  if (!existsSync(file)) throw new Error(`读不到 sitemap：${file}（先跑 hugo 生成 public/）`);
  const xml = readFileSync(file, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function postBatch(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000),
  });
  return res.status;
}

const EXPLAIN = {
  200: "提交成功",
  202: "已接收，等待引擎验证 key（首次提交常见）",
  400: "请求格式错（URL 未按 RFC 3986 编码 / 缺字段）",
  403: "key 无效（key 文件没部署、或文件内容与 key 不一致）",
  422: "URL 不属于该 host，或 key 与 host 不匹配",
  429: "被限流，稍后重试",
};

const opts = parseArgs(process.argv.slice(2));
const { key, file } = findKey();
const urls = readSitemapUrls(opts.sitemap);
if (urls.length === 0) throw new Error(`${opts.sitemap} 里没有 <loc>`);

const host = new URL(urls[0]).host;
const origin = new URL(urls[0]).origin;
const keyLocation = `${origin}/${key}.txt`;
const batch = urls.slice(0, Number.isFinite(opts.limit) ? opts.limit : urls.length);

console.log(`key 文件：${file}`);
console.log(`host：${host}    keyLocation：${keyLocation}`);
console.log(`sitemap：${opts.sitemap}（共 ${urls.length} 条）→ 本次提交 ${batch.length} 条`);
if (batch.length > 1 && opts.limit === Infinity) {
  console.log("注意：这是全量提交。IndexNow 官方只建议在整站新上线/迁移时这么做，日常更新请只提交有改动的 URL。");
}

if (opts.dryRun) {
  console.log("\n--dry-run，不发请求。前 10 条：");
  batch.slice(0, 10).forEach((u) => console.log("  " + u));
  process.exit(0);
}

let ok = 0;
let failed = 0;
const total = Math.ceil(batch.length / BATCH_MAX);
for (let i = 0; i < batch.length; i += BATCH_MAX) {
  const slice = batch.slice(i, i + BATCH_MAX);
  const n = i / BATCH_MAX + 1;
  try {
    const status = await postBatch(opts.endpoint, { host, key, keyLocation, urlList: slice });
    const note = EXPLAIN[status] || "";
    console.log(`批次 ${n}/${total}：${slice.length} 条 → HTTP ${status}${note ? " " + note : ""}`);
    if (status === 200 || status === 202) ok += slice.length;
    else failed += slice.length;
  } catch (e) {
    console.error(`批次 ${n}/${total}：请求失败 → ${e.message}`);
    failed += slice.length;
  }
}

console.log(`\n完成：成功 ${ok} 条，失败 ${failed} 条（端点 ${opts.endpoint}）`);
if (failed > 0) process.exit(1);
