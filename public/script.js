const API_URL = 'http://localhost:3002';

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Automatically load all events when "All Events" tab is selected
    if (tabName === 'all') {
        fetchAllEvents();
    }
}

function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

function displayEvents(events) {
    const container = document.getElementById('eventsContainer');

    if (!events || events.length === 0) {
        container.innerHTML = '<div class="no-events">No events found</div>';
        return;
    }

    container.innerHTML = '<div class="events-grid">' + events.map(event => `
                <div class="event-card">
                    <div class="event-header">
                        <span class="event-sport">${event.sport_name}</span>
                        <span class="event-id">#${event.event_id}</span>
                    </div>
                    <div class="event-teams">
                        ${event.home_team_name} vs ${event.away_team_name}
                    </div>
                    <div class="event-details">
                        <div class="event-detail">
                            <strong>📅 Date:</strong> ${event.event_date} (${event.weekday_name})
                        </div>
                        <div class="event-detail">
                            <strong>⏰ Time:</strong> ${event.event_time}
                        </div>
                        <div class="event-detail">
                            <strong>📍 Location:</strong> ${event.location}
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="btn-danger" onclick="deleteEvent(${event.event_id})">Delete</button>
                    </div>
                </div>
            `).join('') + '</div>';
}

async function fetchAllEvents() {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<div class="loading">Loading events...</div>';

    try {
        const response = await fetch(`${API_URL}/info/events`);
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        container.innerHTML = `<div class="error">Error loading events: ${error.message}</div>`;
    }
}

async function searchByDate() {
    const date = document.getElementById('searchDate').value;
    if (!date) {
        showMessage('Please select a date', 'error');
        return;
    }

    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch(`${API_URL}/info/events/search/date/${date}`);
        const events = await response.json();

        if (response.ok) {
            displayEvents(events);
        } else {
            container.innerHTML = `<div class="error">${events.error}</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="error">Error searching events: ${error.message}</div>`;
    }
}

async function searchByLocation() {
    const location = document.getElementById('searchLocation').value;
    if (!location) {
        showMessage('Please enter a location', 'error');
        return;
    }

    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch(`${API_URL}/info/events/search/location/${encodeURIComponent(location)}`);
        const events = await response.json();

        if (response.ok) {
            displayEvents(events);
        } else {
            container.innerHTML = `<div class="error">${events.error}</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="error">Error searching events: ${error.message}</div>`;
    }
}

async function searchByTeam() {
    const team = document.getElementById('searchTeam').value;
    if (!team) {
        showMessage('Please enter a team name', 'error');
        return;
    }

    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch(`${API_URL}/info/events/search/team/${encodeURIComponent(team)}`);
        const events = await response.json();

        if (response.ok) {
            displayEvents(events);
        } else {
            container.innerHTML = `<div class="error">${events.error}</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="error">Error searching events: ${error.message}</div>`;
    }
}

async function searchBySport() {
    const sport = document.getElementById('searchSport').value;
    if (!sport) {
        showMessage('Please enter a sport name', 'error');
        return;
    }

    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch(`${API_URL}/info/events/search/sportName/${encodeURIComponent(sport)}`);
        const events = await response.json();

        if (response.ok) {
            displayEvents(events);
        } else {
            container.innerHTML = `<div class="error">${events.error}</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="error">Error searching events: ${error.message}</div>`;
    }
}

async function searchBySpecific() {
    const date = document.getElementById('searchSpecificDate').value;
    const homeTeam = document.getElementById('searchHomeTeam').value;
    const awayTeam = document.getElementById('searchAwayTeam').value;

    if (!date || !homeTeam || !awayTeam) {
        showMessage('Please fill in all fields for specific search', 'error');
        return;
    }

    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch(`${API_URL}/info/events/search/specific?date=${date}&home_team_name=${encodeURIComponent(homeTeam)}&away_team_name=${encodeURIComponent(awayTeam)}`);
        const event = await response.json();

        if (response.ok) {
            displayEvents([event]);
        } else {
            container.innerHTML = `<div class="error">${event.error}</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="error">Error searching events: ${error.message}</div>`;
    }
}

async function addEvent(e) {
    e.preventDefault();

    const eventData = {
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        home_team_name: document.getElementById('homeTeamName').value,
        home_team_city: document.getElementById('homeTeamCity').value,
        away_team_name: document.getElementById('awayTeamName').value,
        away_team_city: document.getElementById('awayTeamCity').value,
        sport_name: document.getElementById('sportName').value
    };

    try {
        const response = await fetch(`${API_URL}/info/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`Event added successfully! ID: ${result.event_id}`, 'success');
            e.target.reset();
            fetchAllEvents();
        } else {
            showMessage(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Error adding event: ${error.message}`, 'error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/info/events/${eventId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Event deleted successfully!', 'success');
            fetchAllEvents();
        } else {
            showMessage(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Error deleting event: ${error.message}`, 'error');
    }
}

// Load all events on page load
window.addEventListener('load', () => {
    fetchAllEvents();
});
