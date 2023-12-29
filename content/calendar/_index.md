---
title: "Training Calendar"
type: "calendar"
weight: 10
---
<html>
<head>
    <link rel='stylesheet' type='text/css' href='fullcalendar.css' />
<script type='text/javascript' src='jquery.js'></script>
    <meta charset='utf-8' />
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth'
        });
        calendar.render();
      });
    </script>
  </head>
<div id='calendar'></div>


<script>
  document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: [
        { title: 'Guard', start: '2024-01-01', end: '2024-01-06'},
        { title: 'Side Control', start: '2024-01-08', end: '2024-01-13' },
        { title: 'Mount', start: '2024-01-15', end: '2024-01-20' },
        { title: 'Back Mount', start: '2024-01-22', end: '2024-01-27' },
        { title: 'Back Mount', start: '2024-01-29', end: '2024-02-01' }
        // Add more events here
      ]
    });
    calendar.render();
  });
</script>
</html>
