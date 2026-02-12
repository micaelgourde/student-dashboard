const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const selectedDayElement = document.getElementById('selectedDay');
const selectedDayNameElement = document.getElementById('selectedDayName');
const selectedMonthYearElement = document.getElementById('selectedMonthYear');
const addEventBtn = document.getElementById('addEventBtn');
const addEventSaveBtn = document.getElementById('addEventSaveBtn');

let events = JSON.parse(localStorage.getItem('events')) || [];

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
        
        const hasEvent = events.some(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            // Set to start of day for accurate comparison
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(0, 0, 0, 0);
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
        
            return checkDate >= eventStart && checkDate <= eventEnd;
        });

        let classes = 'date';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (hasEvent) classes += ' has-event';
        
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

    const filteredEvents = events.filter(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(0, 0, 0, 0);
        const checkDate = new Date(selectedDate);
        checkDate.setHours(0, 0, 0, 0);
        
        return checkDate >= eventStart && checkDate <= eventEnd;
    });

    displayEvents(filteredEvents);
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

addEventSaveBtn.addEventListener('click', () => {
    // Save Event
    const eventName = document.getElementById('inputEventName');
    const eventDescription = document.getElementById('textareaEventDescription');
    const eventLocation = document.getElementById('inputLocation');
    const startDateTime = document.getElementById('eventStartDateTime');
    const endDateTime = document.getElementById('eventEndDateTime');
    const newEvent = {
        id: Date.now(),
        title: eventName.value,
        description: eventDescription.value,
        location: eventLocation.value,
        start: startDateTime.value,
        end: endDateTime.value
    }
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));

    // Close Modal
    const modalElement = document.getElementById('addEventModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    // Clear fields
    eventName.value = '';
    eventDescription.value = '';
    eventLocation.value = '';
    startDateTime.value = '';
    endDateTime.value = '';
    updateSidebar();
});

function displayEvents(eventsForDay) {
    const eventsList = document.getElementById('eventsList');
    const template = document.getElementById('eventCardTemplate');

    eventsList.innerHTML = '';

    if (eventsForDay.length === 0) {
        eventsList.innerHTML = '<p class="text-muted text-center py-4">No events scheduled</p>';
        return;
    }

    // Sort by date
    eventsForDay.sort((a,b) => new Date(a.start) - new Date(b.start));

    // Build HTML
    eventsForDay.forEach(event => {
        const clone = template.content.cloneNode(true);

        const start = new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const end = new Date(event.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        clone.querySelector('.event-title').textContent = event.title;
        clone.querySelector('.event-time').textContent = `${start} – ${end}`;
        
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const isSameDay = startDate.toDateString() === endDate.toDateString();

        if (isSameDay) {
            clone.querySelector('.event-fulltime').textContent =
                startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } else {
            clone.querySelector('.event-fulltime').textContent =
                `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }

        if (event.description) {
            clone.querySelector('.event-description').textContent = event.description;
        } else {
            clone.querySelector('.event-description').remove();
        }

        if (event.location) {
            clone.querySelector('.event-location').textContent = `📍 ${event.location}`;
        } else {
            clone.querySelector('.event-location').remove();
        }

        const header = clone.querySelector('.event-header');
        const collapse = clone.querySelector('.event-collapse');
        const collapseId = `event-${event.id}`;

        collapse.id = collapseId;
        header.setAttribute('data-bs-toggle', 'collapse');
        header.setAttribute('data-bs-target', `#${collapseId}`);
        header.setAttribute('role', 'button');
        header.style.cursor = 'pointer';
        
        eventsList.appendChild(clone);
    });
}
// Initialize calendar and sidebar on page load
updateCalendar();
updateSidebar();