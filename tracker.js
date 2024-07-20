let watchId = null;
let timerId = null;
let startTime = null;
let lastPosition = null;
let totalDistance = 0;
let maxSpeed = 0;
let totalSpeed = 0;
let speedCount = 0;

document.getElementById('startButton').addEventListener('click', startTracking);
document.getElementById('stopButton').addEventListener('click', stopTracking);
document.getElementById('toggleDarkMode').addEventListener('click', toggleDarkMode);

function startTracking() {
    if (navigator.geolocation) {
        document.getElementById('status').innerText = "Standort wird ermittelt...";
        startTime = new Date();
        totalDistance = 0;
        maxSpeed = 0;
        totalSpeed = 0;
        speedCount = 0;

        watchId = navigator.geolocation.watchPosition(showPosition, showError, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });

        timerId = setInterval(updateTime, 1000);

        document.getElementById('startButton').disabled = true;
        document.getElementById('stopButton').disabled = false;

        // Initial verstecken von Geschwindigkeits- und Höheninformationen
        document.getElementById('speedStats').classList.add('hidden');
    } else {
        document.getElementById('status').innerText = "Geolocation wird von diesem Browser nicht unterstützt.";
    }
}

function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }

    document.getElementById('status').innerText = "Tracking gestoppt.";
    document.getElementById('startButton').disabled = false;
    document.getElementById('stopButton').disabled = true;

    // Berechnung der Durchschnittsgeschwindigkeit
    const avgSpeed = speedCount ? totalSpeed / speedCount : 0;

    // Zeigen der Geschwindigkeits- und Höheninformationen am Ende des Trackings
    document.getElementById('speedStats').classList.remove('hidden');
    document.getElementById('maxSpeed').innerText = `Höchstgeschwindigkeit: ${maxSpeed.toFixed(2)} m/s`;
    document.getElementById('avgSpeed').innerText = `Durchschnittsgeschwindigkeit: ${avgSpeed.toFixed(2)} m/s`;

    // Höhe nur anzeigen, wenn sie verfügbar ist
    const altitudeElem = document.getElementById('altitude');
    if (lastPosition && lastPosition.altitude !== null) {
        altitudeElem.innerText = `Höhe: ${lastPosition.altitude.toFixed(2)} Meter`;
    } else {
        altitudeElem.innerText = "Höhe: Unbekannt";
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const altitude = position.coords.altitude;
    const altitudeAccuracy = position.coords.altitudeAccuracy;
    const currentTime = new Date();

    if (lastPosition) {
        const distance = calculateDistance(
            lastPosition.latitude, lastPosition.longitude,
            latitude, longitude
        );
        totalDistance += distance;

        const timeElapsed = (currentTime - lastPosition.time) / 1000; // Zeit in Sekunden
        const speed = distance / timeElapsed; // Geschwindigkeit in m/s
        if (speed > maxSpeed) {
            maxSpeed = speed;
        }
        totalSpeed += speed;
        speedCount++;

        // Berechnung der aktuellen Geschwindigkeit
        const currentSpeed = distance / timeElapsed;

        document.getElementById('currentSpeed').innerText = `Aktuelle Geschwindigkeit: ${currentSpeed.toFixed(2)} m/s`;
    }

    document.getElementById('status').innerText = "Standort gefunden!";
    document.getElementById('coords').innerText = `Breitengrad: ${latitude}, Längengrad: ${longitude}, Genauigkeit: ${accuracy} Meter`;
    document.getElementById('distance').innerText = `Zurückgelegte Strecke: ${totalDistance.toFixed(2)} Meter`;
    if (altitude !== null) {
        document.getElementById('altitude').innerText = `Höhe: ${altitude.toFixed(2)} Meter, Genauigkeit: ${altitudeAccuracy} Meter`;
    } else {
        document.getElementById('altitude').innerText = "Höhe: Unbekannt";
    }

    lastPosition = {
        latitude: latitude,
        longitude: longitude,
        time: currentTime,
        altitude: altitude
    };
}

function updateTime() {
    if (startTime) {
        const currentTime = new Date();
        const totalTime = Math.floor((currentTime - startTime) / 1000);
        document.getElementById('time').innerText = `Verstrichene Zeit: ${totalTime} Sekunden`;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Erdradius in Metern
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Entfernung in Metern
    return distance;
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('status').innerText = "Benutzer hat die Standortanfrage abgelehnt.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('status').innerText = "Standortinformationen sind nicht verfügbar.";
            break;
        case error.TIMEOUT:
            document.getElementById('status').innerText = "Die Anfrage zum Abrufen des Standorts ist abgelaufen.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('status').innerText = "Ein unbekannter Fehler ist aufgetreten.";
            break;
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark');
    document.getElementById('toggleDarkMode').innerText = isDarkMode ? "Light Mode" : "Dark Mode";
    localStorage.setItem('darkMode', isDarkMode.toString());
}

// Lade die gespeicherte Dark Mode-Einstellung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark');
        document.getElementById('toggleDarkMode').innerText = "Light Mode";
    } else {
        document.body.classList.remove('dark');
        document.getElementById('toggleDarkMode').innerText = "Dark Mode";
    }
});
