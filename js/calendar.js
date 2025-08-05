document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  fetch("notion-api/data.json")
    .then(res => res.json())
    .then(data => {
      const events = data.map(item => {
        let start = null;
        let end = null;
        if (item.持续时间 && item.持续时间.includes("→")) {
          [start, end] = item.持续时间.split("→").map(s => s.trim());
        } else {
          start = item.持续时间;
        }

        return {
          title: item.名称 + (item.阶段 ? ' - ' + item.阶段 : ''),
          start: start || undefined,
          end: end || undefined,
          allDay: true
        };
      });

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events
      });

      calendar.render();
    });
});
