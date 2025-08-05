fetch("notion-api/data.json")
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector("#data-table tbody");
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.名称}</td>
        <td>${Array.isArray(item.图片链接) ? item.图片链接.map((url, i) =>
        `<a href="${url}" target="_blank">图片${i + 1}</a>`
        ).join("<br>") : ""}</td>

        <td>${item.持续时间}</td>
        <td>${item.状态}</td>
        <td>${item.阶段}</td>
        <td>${item.颜色标记}</td>
        <td>${item.暂时不做}</td>
      `;
      tbody.appendChild(row);
    });
  });
