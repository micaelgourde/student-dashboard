const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const selectedDayElement = document.getElementById('selectedDay');
const selectedDayNameElement = document.getElementById('selectedDayName');
const selectedMonthYearElement = document.getElementById('selectedMonthYear');
const addEventBtn = document.getElementById('addEventBtn');
const addEventSaveBtn = document.getElementById('addEventSaveBtn');
const editEventSaveBtn = document.getElementById('editEventSaveBtn');
const deleteEventConfirmBtn = document.getElementById('deleteEventConfirmBtn');

let events = JSON.parse(localStorage.getItem('events')) || [];

let currentDate = new Date();
let selectedDate = new Date(); // Track selected date
let editingEventId = null; // Track which event is being edited
let deletingEventId = null; // Track which event is being deleted

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

    let isValid = true;
    
    const nameError = document.getElementById('nameError');
    const startError = document.getElementById('startError');
    const endError = document.getElementById('endError');
    const endAfterStartError = document.getElementById('endAfterStartError');
    
    // Reset errors
    nameError.classList.remove('show');
    startError.classList.remove('show');
    endError.classList.remove('show');
    endAfterStartError.classList.remove('show');
    
    // Check event name
    if (!eventName.value.trim()) {
        nameError.textContent = 'Event name is required';
        nameError.classList.add('show');
        isValid = false;
    } else if (eventName.value.trim().length > 100) {
        nameError.textContent = 'Event name must be less than 100 characters';
        nameError.classList.add('show');
        isValid = false;
    }
    
    // Check description length
    if (eventDescription.value.length > 500) {
        nameError.textContent = 'Description must be less than 500 characters';
        nameError.classList.add('show');
        isValid = false;
    }
    
    // Check location length
    if (eventLocation.value.length > 200) {
        nameError.textContent = 'Location must be less than 200 characters';
        nameError.classList.add('show');
        isValid = false;
    }
    
    // Check start time
    if (!startDateTime.value) {
        startError.classList.add('show');
        isValid = false;
    }
    
    // Check end time
    if (!endDateTime.value) {
        endError.classList.add('show');
        isValid = false;
    } else if (startDateTime.value) {
        const start = new Date(startDateTime.value);
        const end = new Date(endDateTime.value);
        
        if (end <= start) {
            endAfterStartError.textContent = 'End date must be after start date';
            endAfterStartError.classList.add('show');
            isValid = false;
        } else {
            const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
            if (daysDiff > 30) {
                endAfterStartError.textContent = 'Event cannot be longer than 30 days';
                endAfterStartError.classList.add('show');
                isValid = false;
            }
        }
    }
    
    if (!isValid) return;
    

    const newEvent = {
        id: Date.now(),
        title: eventName.value.trim(),
        description: eventDescription.value.trim(),
        location: eventLocation.value.trim(),
        start: startDateTime.value,
        end: endDateTime.value
    }
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));

    selectedDate = new Date(startDateTime.value);
    currentDate = new Date(startDateTime.value); 

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
    updateCalendar();
});

editEventSaveBtn.addEventListener('click', () => {
    // Save edited event
    const eventName = document.getElementById('inputEditEventName');
    const eventDescription = document.getElementById('textareaEditEventDescription');
    const eventLocation = document.getElementById('inputEditLocation');
    const startDateTime = document.getElementById('editEventStartDateTime');
    const endDateTime = document.getElementById('editEventEndDateTime');

    let isValid = true;
    
    const nameError = document.getElementById('editNameError');
    const startError = document.getElementById('editStartError');
    const endError = document.getElementById('editEndError');
    const endAfterStartError = document.getElementById('editEndAfterStartError');
    
    // Reset errors
    nameError.classList.remove('show');
    startError.classList.remove('show');
    endError.classList.remove('show');
    endAfterStartError.classList.remove('show');
    
    // Check event name
    if (!eventName.value.trim()) {
        nameError.textContent = 'Event name is required';
        nameError.classList.add('show');
        isValid = false;
    } else if (eventName.value.trim().length > 100) {
        nameError.textContent = 'Event name must be less than 100 characters';
        nameError.classList.add('show');
        isValid = false;
    }
    
    // Check description length
    if (eventDescription.value.length > 500) {
        nameError.textContent = 'Description must be less than 500 characters';
        nameError.classList.add('show');
        isValid = false;
    }
    
    // Check location length
    if (eventLocation.value.length > 200) {
        nameError.textContent = 'Location must be less than 200 characters';
        nameError.classList.add('show');
        isValid = false;
    }
    
    // Check start time
    if (!startDateTime.value) {
        startError.classList.add('show');
        isValid = false;
    }
    
    // Check end time
    if (!endDateTime.value) {
        endError.classList.add('show');
        isValid = false;
    } else if (startDateTime.value) {
        const start = new Date(startDateTime.value);
        const end = new Date(endDateTime.value);
        
        if (end <= start) {
            endAfterStartError.textContent = 'End date must be after start date';
            endAfterStartError.classList.add('show');
            isValid = false;
        } else {
            const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
            if (daysDiff > 30) {
                endAfterStartError.textContent = 'Event cannot be longer than 30 days';
                endAfterStartError.classList.add('show');
                isValid = false;
            }
        }
    }
    
    if (!isValid) return;

    // Find and update the event
    const eventIndex = events.findIndex(e => e.id === editingEventId);
    if (eventIndex !== -1) {
        events[eventIndex] = {
            id: editingEventId,
            title: eventName.value.trim(),
            description: eventDescription.value.trim(),
            location: eventLocation.value.trim(),
            start: startDateTime.value,
            end: endDateTime.value
        };
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Close Modal
    const modalElement = document.getElementById('editEventModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    // Clear fields
    eventName.value = '';
    eventDescription.value = '';
    eventLocation.value = '';
    startDateTime.value = '';
    endDateTime.value = '';
    editingEventId = null;

    updateSidebar();
    updateCalendar();
});

deleteEventConfirmBtn.addEventListener('click', () => {
    // Delete the event
    events = events.filter(e => e.id !== deletingEventId);
    localStorage.setItem('events', JSON.stringify(events));

    // Close Modal
    const modalElement = document.getElementById('deleteEventModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    deletingEventId = null;

    updateSidebar();
    updateCalendar();
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
        
        // Add edit button functionality
        const editBtn = clone.querySelector('.event-edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent collapse toggle
            
            editingEventId = event.id;
            
            // Populate edit modal with event data
            document.getElementById('inputEditEventName').value = event.title;
            document.getElementById('textareaEditEventDescription').value = event.description || '';
            document.getElementById('inputEditLocation').value = event.location || '';
            document.getElementById('editEventStartDateTime').value = event.start;
            document.getElementById('editEventEndDateTime').value = event.end;
            
            // Open edit modal
            const modalElement = document.getElementById('editEventModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        });

        // Add delete button functionality
        const deleteBtn = clone.querySelector('.event-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent collapse toggle
            
            deletingEventId = event.id;
            
            // Set event name in confirmation modal
            document.getElementById('deleteEventName').textContent = event.title;
            
            // Open delete confirmation modal
            const modalElement = document.getElementById('deleteEventModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        });
        
        eventsList.appendChild(clone);
    });
}
// Initialize calendar and sidebar on page load
updateCalendar();
updateSidebar();