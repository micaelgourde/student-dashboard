const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const selectedDayElement = document.getElementById('selectedDay');
const selectedDayNameElement = document.getElementById('selectedDayName');
const selectedMonthYearElement = document.getElementById('selectedMonthYear');
const addEventBtn = document.getElementById('addEventBtn');

let currentDate = new Date();
let selectedDate = new Date(); // Track selected date

const updateCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();

    const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = monthYearString;

    let datesHTML = '';

    // Previous month's dates
    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
        datesHTML += `<div class="date inactive" data-date="${prevDate.toISOString()}">${prevDate.getDate()}</div>`;
    }

    // Current month's dates
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        
        let classes = 'date';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        
        datesHTML += `<div class="${classes}" data-date="${date.toISOString()}">${i}</div>`;
    }

    // Next month's dates
    for (let i = 1; i <= 6 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        datesHTML += `<div class="date inactive" data-date="${nextDate.toISOString()}">${nextDate.getDate()}</div>`;
    }

    datesElement.innerHTML = datesHTML;
    
    // Add click listeners to all date elements
    document.querySelectorAll('.date').forEach(dateEl => {
        dateEl.addEventListener('click', () => {
            const dateStr = dateEl.getAttribute('data-date');
            if (dateStr) {
                selectedDate = new Date(dateStr);
                updateSidebar();
                updateCalendar();
            }
        });
    });
}

const updateSidebar = () => {
    const dayNumber = selectedDate.getDate();
    const dayName = selectedDate.toLocaleString('default', { weekday: 'long' });
    const monthYear = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    selectedDayElement.textContent = dayNumber;
    selectedDayNameElement.textContent = dayName;
    selectedMonthYearElement.textContent = monthYear;
}

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

addEventBtn.addEventListener('click', () => {

    const modalElement = document.getElementById('addEventModal');
    const modal = new bootstrap.Modal(modalElement);

    modal.show();
});


// Initialize calendar and sidebar on page load
updateCalendar();
updateSidebar();