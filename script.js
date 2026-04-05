// ============================================
// IMPOSTER GAME - JAVASCRIPT
// Game logic, state management, and event handlers
// ============================================

// ============================================
// GAME STATE
// ============================================

// Word list for the game (at least 10 words as required)
const WORD_LIST = [
    'Pizza',
    'Penguin',
    'Tiger',
    'Mountain',
    'River',
    'Castle',
    'Telescope',
    'Butterfly',
    'Thunder',
    'Mystery',
    'Dragon',
    'Lighthouse',
    'Rainbow',
    'Phoenix',
    'Diamond',
    'Ocean',
    'Volcano',
    'Treasure',
    'Comet',
    'Pyramid'
];

// Main game state object
const gameState = {
    players: [],
    currentImposter: null,
    selectedWord: null,
    currentPlayerIndex: 0,
    gameActive: false,
};

// ============================================
// SCREEN MANAGEMENT
// ============================================

/**
 * Show a specific screen and hide all others
 * @param {string} screenName - The ID of the screen to show (without 'Screen' suffix)
 */
function showScreen(screenName) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenName + 'Screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

/**
 * Navigate to home screen
 */
function goToHome() {
    resetGame();
    showScreen('home');
}

/**
 * Navigate to player setup screen
 */
function goToPlayerSetup() {
    showScreen('playerSetup');
    gameState.players = [];
    updatePlayersList();
}

/**
 * Navigate to pass phone screen
 */
function goToPassPhone() {
    updatePassPhoneDisplay();
    showScreen('passPhone');
}

/**
 * Navigate to role reveal screen
 */
function goToRoleReveal() {
    updateRoleRevealDisplay();
    showScreen('roleReveal');
}

/**
 * Navigate to discussion screen
 */
function goToDiscussion() {
    updateDiscussionPlayersList();
    startCountdown();
    showScreen('discussion');
}

/**
 * Navigate to result screen
 */
function goToResult() {
    updateResultDisplay();
    showScreen('result');
}

// ============================================
// PLAYER MANAGEMENT
// ============================================

/**
 * Add a player from the input field
 */
function addPlayerFromInput() {
    const input = document.getElementById('playerNameInput');
    const playerName = input.value.trim();

    if (playerName === '') {
        alert('Please enter a player name');
        return;
    }

    if (gameState.players.includes(playerName)) {
        alert('This player name already exists');
        return;
    }

    addPlayer(playerName);
    input.value = '';
    input.focus();
}

/**
 * Add a player to the game
 * @param {string} playerName - The name of the player to add
 */
function addPlayer(playerName) {
    gameState.players.push(playerName);
    updatePlayersList();
    updateStartGameButton();
}

/**
 * Remove a player from the game
 * @param {number} index - The index of the player to remove
 */
function removePlayer(index) {
    gameState.players.splice(index, 1);
    updatePlayersList();
    updateStartGameButton();
}

/**
 * Update the players list display
 */
function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');

    playersList.innerHTML = '';
    playerCount.textContent = gameState.players.length;

    gameState.players.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <span>${player}</span>
            <button class="remove-btn" onclick="removePlayer(${index})">Remove</button>
        `;
        playersList.appendChild(li);
    });
}

/**
 * Update the start game button state
 */
function updateStartGameButton() {
    const startBtn = document.getElementById('startGameBtn');
    startBtn.disabled = gameState.players.length < 3;
}

/**
 * Update discussion screen players list
 */
function updateDiscussionPlayersList() {
    const discussionList = document.getElementById('discussionPlayersList');
    discussionList.innerHTML = '';

    gameState.players.forEach((player) => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `<span>${player}</span>`;
        discussionList.appendChild(li);
    });
}

// ============================================
// GAME INITIALIZATION & LOGIC
// ============================================

/**
 * Start the game - initialize roles and navigate to first player
 */
function startGame() {
    if (gameState.players.length < 3) {
        alert('Minimum 3 players required');
        return;
    }

    initializeGame();
    gameState.gameActive = true;
    gameState.currentPlayerIndex = 0;
    goToPassPhone();
}

/**
 * Initialize game state - select imposter and word
 */
function initializeGame() {
    // Select random imposter
    gameState.currentImposter = Math.floor(Math.random() * gameState.players.length);

    // Select random word
    gameState.selectedWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    // Reset player index
    gameState.currentPlayerIndex = 0;
}

/**
 * Get the role for a specific player
 * @param {number} playerIndex - The index of the player
 * @returns {string} The role text to display
 */
function getPlayerRole(playerIndex) {
    if (playerIndex === gameState.currentImposter) {
        return 'You are the Imposter';
    } else {
        return gameState.selectedWord;
    }
}

/**
 * Get current player name
 * @returns {string} The name of the current player
 */
function getCurrentPlayerName() {
    return gameState.players[gameState.currentPlayerIndex];
}

// ============================================
// SCREEN CONTENT UPDATES
// ============================================

/**
 * Update pass phone screen display
 */
function updatePassPhoneDisplay() {
    const playerNameDisplay = document.getElementById('passPhonePlayerName');
    playerNameDisplay.textContent = getCurrentPlayerName();
}

/**
 * Update role reveal screen display
 */
function updateRoleRevealDisplay() {
    const playerNameDisplay = document.getElementById('rolePlayerName');
    const roleText = document.getElementById('roleText');

    playerNameDisplay.textContent = getCurrentPlayerName();
    roleText.textContent = getPlayerRole(gameState.currentPlayerIndex);
}

/**
 * Update result screen display
 */
function updateResultDisplay() {
    const imposterReveal = document.getElementById('imposterReveal');
    imposterReveal.textContent = gameState.players[gameState.currentImposter];
}

// ============================================
// PASS & PLAY FLOW
// ============================================

/**
 * Hide current role and pass to next player
 */
function hideAndPass() {
    gameState.currentPlayerIndex++;

    // All players have revealed their roles, move to discussion
    if (gameState.currentPlayerIndex >= gameState.players.length) {
        goToDiscussion();
    } else {
        // Move to next player
        goToPassPhone();
    }
}

/**
 * Advance to result screen
 */
function proceedToResult() {
    goToResult();
}

// ============================================
// COUNTDOWN TIMER
// ============================================

let countdownInterval = null;
const DISCUSSION_TIME = 30; // 30 seconds for discussion

/**
 * Start countdown timer for discussion phase
 */
function startCountdown() {
    let timeLeft = DISCUSSION_TIME;
    const countdownDisplay = document.getElementById('countdown');

    // Clear any existing timeout
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Update display immediately
    updateCountdownDisplay(timeLeft, countdownDisplay);

    countdownInterval = setInterval(() => {
        timeLeft--;

        updateCountdownDisplay(timeLeft, countdownDisplay);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

/**
 * Format and update countdown display
 * @param {number} seconds - Seconds remaining
 * @param {HTMLElement} element - The element to update
 */
function updateCountdownDisplay(seconds, element) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    element.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============================================
// GAME END & REPLAY
// ============================================

/**
 * Play again - reset game and return to home
 */
function playAgain() {
    resetGame();
    goToHome();
}

/**
 * Reset all game state
 */
function resetGame() {
    gameState.players = [];
    gameState.currentImposter = null;
    gameState.selectedWord = null;
    gameState.currentPlayerIndex = 0;
    gameState.gameActive = false;

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    updatePlayersList();
    updateStartGameButton();
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Initialize event listeners when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Allow Enter key to add player
    document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayerFromInput();
        }
    });

    // Initialize UI
    updatePlayersList();
    updateStartGameButton();

    // Show home screen by default
    showScreen('home');
});
