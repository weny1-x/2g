// js/board.js  —— 直接在浏览器里使用
// 如：<script src="js/board.js"></script>

// 如果 board.js 位于 js/，而 data.json 位于 notion-api/：
const DATA_URL = "notion-api/data.json";
// 如果你的 board.js 位于 notion-api/js/，请改成：
// const DATA_URL = "../data.json";


// 自定义「阶段」列的顺序（从左到右）
const STAGE_ORDER = ["未分组", "调整", "对接", "打样", "生产"];


// 工具：转义
const esc = (s) => String(s ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// 工具：判断是否图片链接（兜底用，数据里如果有 isImage 会优先用）
const isImageUrl = (url = "") => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);

// 渲染“图片 / 附件”链接：
// - 图片：显示“图片1/2…”，点击新标签页预览
// - 附件：显示原文件名，点击下载
function renderLinks(links) {
  if (!Array.isArray(links) || links.length === 0) return "";
  return links
    .map((f, i) => {
      // 兼容两种格式：[{name,url,isImage}] 或 ["https://..."]
      if (typeof f === "string") {
        const url = f;
        if (!url) return "";
        if (isImageUrl(url)) {
          return `<a href="${url}" target="_blank" rel="noopener">图片${i + 1}</a>`;
        }
        return `<a href="${url}" target="_blank" rel="noopener" download>附件</a>`;
      }

      const url = f?.url || "";
      if (!url) return "";
      if (f.isImage || isImageUrl(url)) {
        return `<a href="${url}" target="_blank" rel="noopener">图片${i + 1}</a>`;
      }
      const text = esc(f.name || "附件");
      return `<a href="${url}" target="_blank" rel="noopener" download title="${text}">${text}</a>`;
    })
    .filter(Boolean)
    .join(" ");
}

function cardHTML(item) {
  return `
    <div class="card">
      <div class="card-title">${esc(item.名称 || "")}</div>
      <div class="card-meta">
        ${item.持续时间 ? `📅 ${esc(item.持续时间)}<br>` : ""}
        ${item.状态 ? `状态：${esc(item.状态)}<br>` : ""}
        ${item.厂家 ? `厂家：${esc(item.厂家)}<br>` : ""}
      </div>
      <div class="card-links">${renderLinks(item.图片链接)}</div>
    </div>
  `;
}

function columnHTML(stageName, items) {
  return `
    <div class="board-column">
      <h3>${esc(stageName)} <span class="count">(${items.length})</span></h3>
      ${items.map(cardHTML).join("")}
    </div>
  `;
}

function sortStagesByOrder(stageNames) {
  // 先按 STAGE_ORDER 排，没列出的阶段按中文/英文名排序并追加在后
  const known = [];
  const unknown = [];
  const set = new Set(stageNames);

  STAGE_ORDER.forEach((s) => {
    if (set.has(s)) known.push(s);
  });

  stageNames.forEach((s) => {
    if (!STAGE_ORDER.includes(s)) unknown.push(s);
  });

  unknown.sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  return [...known, ...unknown];
}

function groupByStage(rows) {
  const bucket = {};
  rows.forEach((item) => {
    const key = (item.阶段 && String(item.阶段).trim()) || "未分组";
    if (!bucket[key]) bucket[key] = [];
    bucket[key].push(item);
  });
  return bucket;
}

function renderBoard(data) {
  // 1) 过滤：隐藏 暂时不做 == ✅ 的条目
  const filtered = (data || []).filter((x) => String(x.暂时不做 || "").trim() !== "✅");

  // 2) 组内排序：按 名称 排序
  filtered.sort((a, b) => (a.名称 || "").localeCompare(b.名称 || "", "zh-Hans-CN"));

  // 3) 分组：按 阶段
  const byStage = groupByStage(filtered);
  const stages = sortStagesByOrder(Object.keys(byStage));

  // 4) 渲染
  const board = document.getElementById("board");
  if (!board) return console.warn("#board 容器不存在");
  board.innerHTML = stages.map((stage) => columnHTML(stage, byStage[stage])).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => renderBoard(data))
    .catch((err) => {
      console.error("Board 渲染失败：", err);
      const board = document.getElementById("board");
      if (board) board.innerHTML = "<p style='color:#ef4444'>看板加载失败，请稍后重试。</p>";
    });
});

