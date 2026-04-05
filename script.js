// ============================================
// IMPOSTER GAME - JAVASCRIPT
// Game logic, state management, and event handlers
// Among Us themed party game
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

const CLUE_TIME = 15; // 15 seconds to say a clue
const DISCUSSION_TIME = 30; // 30 seconds for discussion
const MAX_ROUNDS = 10; // Maximum rounds before game ends

// Main game state object
const gameState = {
    players: [],
    scores: {}, // Track scores for each player
    currentImposter: null,
    selectedWord: null,
    currentPlayerIndex: 0,
    gameActive: false,
    roundNumber: 0,
    maximumRounds: MAX_ROUNDS,
    playerVotes: {}, // Track votes: { playerName: votedForName }
    impostersGuessed: [], // Track if imposter was caught
    imposterCaught: false,
    allPlayersVoted: false,
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
    Object.keys(gameState.scores).forEach(player => {
        delete gameState.scores[player];
    });
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
 * Navigate to clue giving screen
 */
function goToClueGiving() {
    updateClueGivingDisplay();
    startClueTimer();
    showScreen('clueGiving');
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
 * Navigate to voting screen for first player
 */
function goToVoting() {
    gameState.playerVotes = {};
    gameState.allPlayersVoted = false;
    gameState.currentPlayerIndex = 0;
    startVotingPhase();
}

/**
 * Navigate to vote results screen
 */
function goToVoteResults() {
    updateVoteResultsDisplay();
    showScreen('voteResults');
}

/**
 * Navigate to leaderboard screen
 */
function goToLeaderboard() {
    updateLeaderboardDisplay();
    showScreen('leaderboard');
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
    if (!gameState.scores[playerName]) {
        gameState.scores[playerName] = 0;
    }
    updatePlayersList();
    updateStartGameButton();
}

/**
 * Remove a player from the game
 * @param {number} index - The index of the player to remove
 */
function removePlayer(index) {
    const playerName = gameState.players[index];
    gameState.players.splice(index, 1);
    delete gameState.scores[playerName];
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

    gameState.gameActive = true;
    gameState.roundNumber = 1;
    startNewRound();
}

/**
 * Start a new round
 */
function startNewRound() {
    initializeRound();
    gameState.currentPlayerIndex = 0;
    goToPassPhone();
}

/**
 * Initialize round - select imposter and word
 */
function initializeRound() {
    // Select random imposter
    gameState.currentImposter = Math.floor(Math.random() * gameState.players.length);

    // Select random word
    gameState.selectedWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    // Reset state
    gameState.playerVotes = {};
    gameState.allPlayersVoted = false;
    gameState.imposterCaught = false;
}

/**
 * Get the role for a specific player
 * @param {number} playerIndex - The index of the player
 * @returns {string} The role text to display
 */
function getPlayerRole(playerIndex) {
    if (playerIndex === gameState.currentImposter) {
        return 'You are an Imposter';
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
 * Update clue giving screen display
 */
function updateClueGivingDisplay() {
    const playerNameDisplay = document.getElementById('cluePlayerName');
    const roundInfo = document.getElementById('clueRoundInfo');

    playerNameDisplay.textContent = getCurrentPlayerName();
    roundInfo.textContent = `Player ${gameState.currentPlayerIndex + 1} of ${gameState.players.length} • Round ${gameState.roundNumber}`;
}

// ============================================
// PASS & PLAY FLOW
// ============================================

/**
 * Hide current role and pass to next player
 */
function hideAndPass() {
    gameState.currentPlayerIndex++;

    // All players have revealed their roles, move to clue giving
    if (gameState.currentPlayerIndex >= gameState.players.length) {
        gameState.currentPlayerIndex = 0;
        goToClueGiving();
    } else {
        // Move to next player
        goToPassPhone();
    }
}

// ============================================
// CLUE GIVING PHASE
// ============================================

let clueTimerInterval = null;

/**
 * Start countdown timer for clue giving phase
 */
function startClueTimer() {
    let timeLeft = CLUE_TIME;
    const timerDisplay = document.getElementById('clueTimer');

    // Clear any existing timeout
    if (clueTimerInterval) {
        clearInterval(clueTimerInterval);
    }

    // Update display immediately
    updateTimerDisplay(timeLeft, timerDisplay);

    clueTimerInterval = setInterval(() => {
        timeLeft--;

        updateTimerDisplay(timeLeft, timerDisplay);

        if (timeLeft <= 0) {
            clearInterval(clueTimerInterval);
        }
    }, 1000);
}

/**
 * Move to next player in clue giving phase
 */
function nextPlayerClue() {
    if (clueTimerInterval) {
        clearInterval(clueTimerInterval);
    }

    gameState.currentPlayerIndex++;

    if (gameState.currentPlayerIndex >= gameState.players.length) {
        // All players have given clues, move to discussion
        gameState.currentPlayerIndex = 0;
        goToDiscussion();
    } else {
        // Move to next player's clue
        goToClueGiving();
    }
}

// ============================================
// VOTING PHASE
// ============================================

/**
 * Start voting phase - show first player voting screen
 */
function startVotingPhase() {
    gameState.currentPlayerIndex = 0;
    updateVotingDisplay();
    showScreen('voting');
}

/**
 * Update voting screen display
 */
function updateVotingDisplay() {
    const votingPlayerName = document.getElementById('votingPlayerName');
    const votingPlayersList = document.getElementById('votingPlayersList');
    const votingStatus = document.getElementById('votingStatus');

    votingPlayerName.textContent = getCurrentPlayerName();

    votingPlayersList.innerHTML = '';
    gameState.players.forEach((player) => {
        const li = document.createElement('li');
        li.innerHTML = `<button class="voting-button" onclick="castVote('${player}')">${player}</button>`;
        votingPlayersList.appendChild(li);
    });

    const votedCount = Object.keys(gameState.playerVotes).length;
    votingStatus.textContent = `${votedCount} of ${gameState.players.length} players voted`;
}

/**
 * Cast a vote for a player
 * @param {string} votedFor - The player being voted for
 */
function castVote(votedFor) {
    const currentPlayer = getCurrentPlayerName();
    gameState.playerVotes[currentPlayer] = votedFor;

    // Move to next player voting or show results
    gameState.currentPlayerIndex++;

    if (gameState.currentPlayerIndex < gameState.players.length) {
        // More players to vote
        updateVotingDisplay();
    } else {
        // All voted, show results
        goToVoteResults();
    }
}

// ============================================
// VOTE RESULTS & ROUND END
// ============================================

/**
 * Update vote results display
 */
function updateVoteResultsDisplay() {
    const voteResultsList = document.getElementById('voteResultsList');
    const roundResultLabel = document.getElementById('roundResultLabel');
    const roundResultText = document.getElementById('roundResultText');
    const pointsDisplay = document.getElementById('pointsDisplay');

    // Count votes
    const voteCount = {};
    gameState.players.forEach(player => {
        voteCount[player] = 0;
    });

    Object.values(gameState.playerVotes).forEach(votedFor => {
        if (voteCount.hasOwnProperty(votedFor)) {
            voteCount[votedFor]++;
        }
    });

    // Display vote results
    voteResultsList.innerHTML = '';
    Object.entries(voteCount).forEach(([player, votes]) => {
        const li = document.createElement('li');
        const imposterCaught = player === gameState.players[gameState.currentImposter] && votes > 0;
        li.className = `vote-result-item ${imposterCaught ? 'imposter-caught' : ''}`;
        li.innerHTML = `
            <span class="vote-result-name">${player}</span>
            <span class="vote-result-votes">${votes} vote${votes !== 1 ? 's' : ''}</span>
        `;
        voteResultsList.appendChild(li);
    });

    // Determine winner of round and award points
    const maxVotes = Math.max(...Object.values(voteCount), 0);
    const mostVoted = Object.keys(voteCount).find(player => voteCount[player] === maxVotes);
    const imposterName = gameState.players[gameState.currentImposter];

    // Check if imposter was caught
    gameState.imposterCaught = mostVoted === imposterName && maxVotes > 0;

    // Award points
    let pointsAwarded = {};
    gameState.players.forEach(player => {
        pointsAwarded[player] = 0;
    });

    if (gameState.imposterCaught) {
        // Imposter caught - award points to those who voted for imposter
        pointsAwarded[imposterName] = 0; // Imposter gets 0
        Object.entries(gameState.playerVotes).forEach(([voter, votedFor]) => {
            if (votedFor === imposterName) {
                pointsAwarded[voter] = 10; // Caught imposter gets 10 points
            }
        });
        roundResultLabel.textContent = 'Imposter Caught!';
        roundResultText.textContent = `${imposterName} was the Imposter`;
    } else {
        // Imposter not caught - imposter gets max points
        pointsAwarded[imposterName] = 20;
        roundResultLabel.textContent = 'Imposter Escaped!';
        roundResultText.textContent = `${imposterName} fooled everyone`;
    }

    // Update game scores
    Object.entries(pointsAwarded).forEach(([player, points]) => {
        gameState.scores[player] += points;
    });

    // Display points this round
    pointsDisplay.innerHTML = '<h3>Points This Round:</h3>';
    Object.entries(pointsAwarded).forEach(([player, points]) => {
        const pointClass = points > 0 ? 'gained' : 'zero';
        pointsDisplay.innerHTML += `
            <div class="point-item ${pointClass}">
                <span>${player}</span>
                <span>+${points}</span>
            </div>
        `;
    });

    // Determine if game continues or ends
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (gameState.imposterCaught || gameState.roundNumber >= gameState.maximumRounds) {
        nextRoundBtn.textContent = 'View Leaderboard';
        nextRoundBtn.onclick = goToLeaderboard;
    } else {
        nextRoundBtn.textContent = 'Next Round';
        nextRoundBtn.onclick = nextRound;
    }
}

/**
 * Move to next round
 */
function nextRound() {
    gameState.roundNumber++;
    startNewRound();
}

// ============================================
// LEADERBOARD
// ============================================

/**
 * Update and display leaderboard
 */
function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    // Sort players by score (descending)
    const sortedPlayers = gameState.players.sort((a, b) => gameState.scores[b] - gameState.scores[a]);

    sortedPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        const isFirst = index === 0;
        li.className = `leaderboard-item ${isFirst ? 'first' : ''}`;
        li.innerHTML = `
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${player}</span>
            <span class="leaderboard-score">${gameState.scores[player]}</span>
        `;
        leaderboardList.appendChild(li);
    });
}

// ============================================
// COUNTDOWN TIMER
// ============================================

let countdownInterval = null;

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
    updateTimerDisplay(timeLeft, countdownDisplay);

    countdownInterval = setInterval(() => {
        timeLeft--;

        updateTimerDisplay(timeLeft, countdownDisplay);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

/**
 * Format and update timer display
 * @param {number} seconds - Seconds remaining
 * @param {HTMLElement} element - The element to update
 */
function updateTimerDisplay(seconds, element) {
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
    gameState.scores = {};
    gameState.currentImposter = null;
    gameState.selectedWord = null;
    gameState.currentPlayerIndex = 0;
    gameState.gameActive = false;
    gameState.roundNumber = 0;
    gameState.playerVotes = {};
    gameState.impostersGuessed = [];
    gameState.imposterCaught = false;
    gameState.allPlayersVoted = false;

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    if (clueTimerInterval) {
        clearInterval(clueTimerInterval);
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

