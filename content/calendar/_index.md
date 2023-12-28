---
title: "Training Calendar"
type: "calendar"
weight: 10
---

<div id='calendar'></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: [
        { title: 'Strength Training', start: '2023-01-01' },
        { title: 'Cardio Focus', start: '2023-01-07', end: '2023-01-10' },
        // Add more events here
      ]
    });
    calendar.render();
  });
</script>