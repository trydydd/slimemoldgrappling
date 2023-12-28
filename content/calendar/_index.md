---
title: "Training Calendar"
type: "calendar"
weight: 10
---

{{< rawhtml >}}
<style>
.calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr); /* 7 days for a week */
    grid-gap: 5px;
    text-align: center;
}

.day, .day-header {
    border: 1px solid #ddd;
    padding: 15px;
    min-height: 100px; /* Adjust as needed */
}

.day-header {
    background-color: #f0f0f0;
    font-weight: bold;
}

/* Responsive design */
@media (max-width: 600px) {
    .calendar {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
<div class="calendar">
    <!-- Weekday Headers -->
    <div class="day-header">Sun</div>
    <div class="day-header">Mon</div>
    <div class="day-header">Tue</div>
    <div class="day-header">Wed</div>
    <div class="day-header">Thu</div>
    <div class="day-header">Fri</div>
    <div class="day-header">Sat</div>

    
    <div class="day"></div>
    <div class="day"></div>

    <!-- Days of January 2024 -->
    <div class="day">1</div>
    <div class="day">2</div>
    <div class="day">3</div>
    <div class="day">4</div>
    <div class="day">5</div>
    <div class="day">6</div>
    <div class="day">7</div>
    <div class="day">8</div>
    <div class="day">9</div>
    <div class="day">10</div>
    <div class="day">11</div>
    <div class="day">12</div>
    <div class="day">13</div>
    <div class="day">14</div>
    <div class="day">15</div>
    <div class="day">16</div>
    <div class="day">17</div>
    <div class="day">18</div>
    <div class="day">19</div>
    <div class="day">20</div>
    <div class="day">21</div>
    <div class="day">22</div>
    <div class="day">23</div>
    <div class="day">24</div>
    <div class="day">25</div>
    <div class="day">26</div>
    <div class="day">27</div>
    <div class="day">28</div>
    <div class="day">29</div>
    <div class="day">30</div>
    <div class="day">31</div>
</div>
{{< /rawhtml >}}