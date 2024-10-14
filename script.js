// Pobieranie elementów z DOM
const circuitsInput = document.getElementById("circuits"); // Ilość obwodów
const roundsInput = document.getElementById("rounds"); // Ilość rund w obwodzie
const roundTimeInput = document.getElementById("roundTime"); // Czas trwania rundy
const breakTimeInput = document.getElementById("breakTime"); // Czas przerwy między rundami
const circuitBreakTimeInput = document.getElementById("circuitBreakTime"); // Czas przerwy między obwodami
const timerDisplay = document.getElementById("timerDisplay");
const roundLabel = document.getElementById("roundLabel");
const statusLabel = document.getElementById("statusLabel"); // Nowy element statusu
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resetButton = document.getElementById("resetButton");
const beepSound = document.getElementById("beepSound");
const congratsSound = document.getElementById("congratsSound");

let circuits, rounds, roundTime, breakTime, circuitBreakTime;
let currentCircuit = 0;
let currentRound = 0;
let currentPhase = 'round'; // 'round', 'break', 'circuitBreak'
let timeRemaining;
let timerInterval;
let delayTimeout;
let isRunning = false;
let isPaused = false; // Dodana zmienna do śledzenia pauzy

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/trening-app/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker zarejestrowany z zakresem:', registration.scope);
            }, function(err) {
                console.log('Rejestracja Service Workera nie powiodła się:', err);
            });
    });
}

let wakeLock = null;

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock: Screen is active');
    } catch (err) {
        console.error(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => {
            wakeLock = null;
            console.log('Wake Lock released');
        });
    }
}

// Wywołaj requestWakeLock, gdy zaczynasz minutnik
document.getElementById('startButton').addEventListener('click', () => {
    requestWakeLock();
});

// Wywołaj releaseWakeLock, gdy zatrzymujesz minutnik lub resetujesz
document.getElementById('stopButton').addEventListener('click', () => {
    releaseWakeLock();
});

document.getElementById('resetButton').addEventListener('click', () => {
    releaseWakeLock();
});


// Funkcja do formatowania czasu w stylu MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Aktualizacja wyświetlanego czasu, etykiety rundy i statusu
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
    roundLabel.textContent = `Obwód: ${currentCircuit} z ${circuits}, Runda: ${currentRound} z ${rounds}`;
    updateStatusLabel();
}

// Funkcja do aktualizacji etykiety statusu
function updateStatusLabel() {
    if (currentPhase === 'round') {
        statusLabel.textContent = "Ogień!";
    } else if (currentPhase === 'break') {
        statusLabel.textContent = "Przerwa";
    } else if (currentPhase === 'circuitBreak') {
        statusLabel.textContent = "Przerwa między obwodami";
    }
}

// Start minutnika
function startTimer() {
    if (isRunning) return;

    circuits = parseInt(circuitsInput.value);
    rounds = parseInt(roundsInput.value);
    roundTime = parseInt(roundTimeInput.value);
    breakTime = parseInt(breakTimeInput.value);
    circuitBreakTime = parseInt(circuitBreakTimeInput.value);

    currentCircuit = 1;
    currentRound = 1;
    currentPhase = 'round';
    timeRemaining = roundTime;

    startButton.disabled = true;
    stopButton.disabled = true;  // Wyłącz przycisk STOP na początku
    resetButton.disabled = true; // Wyłącz przycisk RESET na początku

    // Opóźniony start o 3 sekundy
    let countdown = 3;
    updateDisplay();
    timerDisplay.textContent = `00:0${countdown}`;
    beepSound.play();

    const countdownInterval = setInterval(() => {
        countdown--;
        timerDisplay.textContent = `00:0${countdown}`;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            isRunning = true;
            updateDisplay();
            timerInterval = setInterval(timerTick, 1000);
            beepSound.play();

            // Włącz przycisk STOP i RESET po zakończeniu odliczania opóźnienia
            stopButton.disabled = false;
            resetButton.disabled = false;
        }
    }, 1000);
}

// Zatrzymanie i wznowienie minutnika
function stopTimer() {
    if (isPaused) {
        // Wznowienie minutnika
        isPaused = false;
        stopButton.textContent = "Stop"; // Zmieniamy nazwę przycisku na "Stop"
        timerInterval = setInterval(timerTick, 1000); // Ponownie uruchamiamy minutnik
    } else {
        // Pauza minutnika
        clearInterval(timerInterval); // Zatrzymujemy minutnik
        isPaused = true;
        stopButton.textContent = "Wznów"; // Zmieniamy nazwę przycisku na "Wznów"
    }
}

// Reset minutnika
function resetTimer() {
    // Resetujemy wszystkie zmienne do wartości początkowych
    clearInterval(timerInterval);
    clearTimeout(delayTimeout);

    isRunning = false;
    isPaused = false;
    currentCircuit = 0;
    currentRound = 0;
    currentPhase = 'round';

    timerDisplay.textContent = '';
    roundLabel.textContent = ''; // Wyczyść etykietę z informacją o obwodzie i rundzie
    statusLabel.textContent = ''; // Wyczyść etykietę statusu

    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = true;
    stopButton.textContent = "Stop"; // Resetujemy nazwę przycisku na "Stop"
}

// Funkcja wykonująca odliczanie czasu
function timerTick() {
    timeRemaining--;

    // Sprawdzanie dźwięku na 3 sekundy przed końcem
    if (timeRemaining === 3) {
        beepSound.play();
    }

    // Zakończenie rundy, przerwy lub obwodu
    if (timeRemaining < 0) {
        if (currentPhase === 'round') {
            if (currentRound < rounds) {
                currentPhase = 'break';
                timeRemaining = breakTime;
            } else if (currentCircuit < circuits) {
                currentPhase = 'circuitBreak';
                timeRemaining = circuitBreakTime;
            } else {
                stopTimer();
                timerDisplay.textContent = "00:00";
                roundLabel.textContent = `Koniec treningu! Gratulacje!`;
                statusLabel.textContent = ''; // Po zakończeniu obwodów, wyczyść status
                congratsSound.play();
                stopButton.classList.add('hidden');
                startButton.classList.add('hidden');
                return;
            }
        } else if (currentPhase === 'break') {
            currentRound++;
            currentPhase = 'round';
            timeRemaining = roundTime;
        } else if (currentPhase === 'circuitBreak') {
            currentCircuit++;
            currentRound = 1;
            currentPhase = 'round';
            timeRemaining = roundTime;
        }
    }

    updateDisplay();
}

// Obsługa kliknięć przycisków
startButton.addEventListener("click", () => {
        const settings = document.getElementById('settings');
        settings.classList.add('hidden');
        startTimer();
});
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", () => {
    // Pokaż okno dialogowe potwierdzenia
    const confirmReset = confirm("Czy na pewno chcesz zresetować trening?");

    // Jeśli użytkownik potwierdzi reset
    if (confirmReset) {
        const settings = document.getElementById('settings');
        settings.classList.remove('hidden');
        const start_button = document.getElementById('startButton');
        start_button.classList.remove('hidden');
        const stop_button = document.getElementById('stopButton');
        stop_button.classList.remove('hidden');
        resetTimer();
    }
});

// // Funkcja, która ukrywa div po naciśnięciu przycisku Start
// document.getElementById('startButton').addEventListener('click', () => {
//     // Pobieranie elementu div o id 'timerContainer'
//     const timerContainer = document.getElementById('timerContainer');
//
//     // Dodanie klasy 'hidden', która ustawia display na 'none'
//     timerContainer.classList.add('hidden');
// });
