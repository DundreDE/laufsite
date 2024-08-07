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
            maximumAge: 0,
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
    const accuracy = position.coords.accuracy; // Genauigkeit der Standortdaten
    const altitude = position.coords.altitude;
    const altitudeAccuracy = position.coords.altitudeAccuracy;

    if (lastPosition) {
        const distance = calculateDistance(
            lastPosition.latitude, lastPosition.longitude,
            latitude, longitude
        );
        totalDistance += distance;

        const timeElapsed = (new Date() - lastPosition.time) / 1000; // Zeit in Sekunden
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
    document.getElementById('coords').innerText = `Breitengrad: ${latitude}, Längengrad: ${longitude}, Genauigkeit: ${accuracy.toFixed(2)} Meter`;
    document.getElementById('distance').innerText = `Zurückgelegte Strecke: ${totalDistance.toFixed(2)} Meter`;
    document.getElementById('altitude').innerText = altitude !== null ? `Höhe: ${altitude.toFixed(2)} Meter, Genauigkeit: ${altitudeAccuracy} Meter` : "Höhe: Unbekannt";

    lastPosition = {
        latitude: latitude,
        longitude: longitude,
        time: new Date(),
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

    return R * c; // in Metern
}

function showError(error) {
    let errorMessage = "";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "Benutzer hat die Anfrage für Standortdaten abgelehnt.";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "Standortdaten sind nicht verfügbar.";
            break;
        case error.TIMEOUT:
            errorMessage = "Die Anfrage für Standortdaten ist abgelaufen.";
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = "Ein unbekannter Fehler ist aufgetreten.";
            break;
        default:
            errorMessage = "Ein Fehler ist aufgetreten.";
    }
    document.getElementById('error-message').innerText = errorMessage;
    document.getElementById('error-message').classList.remove('hidden');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    document.getElementById('toggleDarkMode').innerText = isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    // Speicher die Wahl des Users im Local Storage
    localStorage.setItem('darkMode', isDarkMode);
}

// Lade die gespeicherte Dark Mode-Einstellung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark');
        document.getElementById('toggleDarkMode').innerText = 'Toggle Light Mode';
    } else {
        document.getElementById('toggleDarkMode').innerText = 'Toggle Dark Mode';
    }
});
