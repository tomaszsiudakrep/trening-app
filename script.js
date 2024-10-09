// Pobieranie elementów z DOM
const roundsInput = document.getElementById("rounds");
const roundTimeInput = document.getElementById("roundTime");
const breakTimeInput = document.getElementById("breakTime");
const timerDisplay = document.getElementById("timerDisplay");
const roundLabel = document.getElementById("roundLabel");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resetButton = document.getElementById("resetButton");
const beepSound = document.getElementById("beepSound");
const congratsSound = document.getElementById("congratsSound");

let rounds, roundTime, breakTime;
let currentRound = 0;
let currentPhase = 'round'; // 'round' lub 'break'
let timeRemaining;
let timerInterval;
let delayTimeout;
let isRunning = false;

// Funkcja do formatowania czasu w stylu MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Aktualizacja wyświetlanego czasu i etykiety rundy
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
    roundLabel.textContent = `Runda: ${currentRound} z ${rounds}`;
}

// Start minutnika
function startTimer() {
    if (isRunning) return;

    rounds = parseInt(roundsInput.value);
    roundTime = parseInt(roundTimeInput.value);
    breakTime = parseInt(breakTimeInput.value);
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

    // Odtworzenie dźwięku od razu po kliknięciu Start
    beepSound.play();

    const countdownInterval = setInterval(() => {
        countdown--;
        timerDisplay.textContent = `00:0${countdown}`;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            isRunning = true;
            updateDisplay();
            timerInterval = setInterval(timerTick, 1000); // Rozpocznij normalne odliczanie rundy
            beepSound.play(); // Dźwięk po zakończeniu odliczania
        }
    }, 1000);
}

// Zatrzymanie minutnika
function stopTimer() {
    clearInterval(timerInterval);
    clearTimeout(delayTimeout);
    isRunning = false;
    startButton.disabled = false;
    stopButton.disabled = true;
}

// Reset minutnika
function resetTimer() {
    stopTimer();
    timerDisplay.textContent = "00:00";
    roundLabel.textContent = ''; // Wyczyść etykietę z informacją o rundzie
    resetButton.disabled = true;
}

// Funkcja wykonująca odliczanie czasu
function timerTick() {
    timeRemaining--;

    // Sprawdzanie dźwięku na 3 sekundy przed końcem
    if (timeRemaining === 3) {
        beepSound.play();
    }

    // Zakończenie rundy lub przerwy
    if (timeRemaining < 0) {
        if (currentPhase === 'round') {
            if (currentRound < rounds) {
                currentPhase = 'break';
                timeRemaining = breakTime;
            } else {
                stopTimer();
                timerDisplay.textContent = "00:00"; // Wyświetlenie 00:00 po zakończeniu
                roundLabel.textContent = `Wszystkie rundy zakończone!`; // Wyświetlenie informacji o zakończeniu
                congratsSound.play(); // Odtwarzanie dźwięku gratulacyjnego po ostatniej rundzie
                // alert("Wszystkie rundy zakończone!");
                return;
            }
        } else if (currentPhase === 'break') {
            currentRound++;
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
