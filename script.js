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
        statusLabel.textContent = "Trwa trening!";
    } else if (currentPhase === 'break') {
        statusLabel.textContent = "Przerwa między rundami";
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
    stopButton.disabled = false;
    resetButton.disabled = false;

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

    timerDisplay.textContent = "00:00";
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
                roundLabel.textContent = `Wszystkie obwody zakończone!`;
                statusLabel.textContent = ''; // Po zakończeniu obwodów, wyczyść status
                congratsSound.play();
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
startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);
