fetch("notion-api/data.json")
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector("#data-table tbody");
    data.forEach(item => {
      const linksCell = Array.isArray(item.图片链接)
        ? item.图片链接.map((f, i) => {
            const url = f?.url || "";
            if (!url) return "";
            // 图片：显示“图片1/2…”
            if (f.isImage) {
              return `<a href="${f.url}" target="_blank" rel="noopener">图片${i + 1}</a>`;
            }
            // 附件：显示原文件名，并可下载
            const text = (f.name || "附件").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return `<a href="${url}" target="_blank" rel="noopener" download>${text}</a>`;
          }).filter(Boolean).join("<br>")
        : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.名称 || ""}</td>
        <td>${linksCell}</td>
        <td>${item.持续时间 || ""}</td>
        <td>${item.状态 || ""}</td>
        <td>${item.阶段 || ""}</td>
        <td>${item.颜色标记 || ""}</td>
        <td>${item.暂时不做 || ""}</td>
      `;
      tbody.appendChild(row);
    });
  });
