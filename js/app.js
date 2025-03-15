/*-------------- Constants -------------*/
const BOARD_SIZE = 5; 

/*---------- Variables (State) ---------*/
const gameState = {
    playerBoard: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)),
    enemyBoard: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)),
    playerShipsPlaced: 0,
    gameStarted: false,
    currentTurn: "player", // Make sure the game starts with player's turn
    gameOver: false
};

let draggedShip = null;

/*----- Cached Element References  -----*/
const playerBoardEl = document.getElementById("player-board");
const enemyBoardEl = document.getElementById("enemy-board");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const messageEl = document.getElementById("message");
const ships = document.querySelectorAll(".ship");

/*-------------- Functions -------------*/

// Initialize the game
function init() {
    gameState.playerBoard = createEmptyBoard();
    gameState.enemyBoard = createEmptyBoard();
    gameState.playerShipsPlaced = 0;
    gameState.gameStarted = false;
    gameState.gameOver = false;
    gameState.currentTurn = "player"; // Ensure it's the player's turn
    messageEl.textContent = "Drag your ships to the board";
    startBtn.disabled = true;

    placeShipsRandomly(gameState.enemyBoard); // 🔹 Place enemy ships
    render();
}

function placeShipsRandomly(board) {
    const shipSizes = [2, 2]; // Two ships, each size 2

    shipSizes.forEach(size => {
        let placed = false;

        while (!placed) {
            let row = Math.floor(Math.random() * BOARD_SIZE);
            let col = Math.floor(Math.random() * (BOARD_SIZE - size)); // Ensure horizontal fit

            if (canPlaceShip(row, col, size, board)) {
                for (let i = 0; i < size; i++) {
                    board[row][col + i] = "ship"; // Place ship horizontally
                }
                placed = true;
            }
        }
    });
}

// Create an empty board
function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

// Render the game board
function render() {
    playerBoardEl.innerHTML = "";
    enemyBoardEl.innerHTML = "";

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const playerCell = document.createElement("div");
            const enemyCell = document.createElement("div");

            playerCell.classList.add("cell");
            enemyCell.classList.add("cell");

            // Player board visuals
            if (gameState.playerBoard[r][c] === "ship") playerCell.classList.add("ship");

            // Enemy board visuals (Hit/Miss)
            if (gameState.enemyBoard[r][c] === "hit") {
                const explosionImg = document.createElement("img");
                explosionImg.src = "./assets/Explosion.png"; // Set the explosion image
                explosionImg.alt = "Explosion";
                enemyCell.appendChild(explosionImg);
            } else if (gameState.enemyBoard[r][c] === "miss") {
                const smokeImg = document.createElement("img");
                smokeImg.src = "./assets/Smoke.png"; // Set the smoke image
                smokeImg.alt = "Missed shot";
                enemyCell.appendChild(smokeImg);
            } else {
                // Allow clicking only if the cell has not been clicked yet and it's the player's turn
                if (gameState.currentTurn === "player") {
                    enemyCell.addEventListener("click", () => handleAttack(r, c, enemyCell));
                    enemyCell.classList.add("clickable"); // Enable hover effect
                }
            }

            playerBoardEl.appendChild(playerCell);
            enemyBoardEl.appendChild(enemyCell);
        }
    }
}

function handleAttack(row, col, enemyCell) {
    if (!gameState.gameStarted || gameState.gameOver || gameState.currentTurn !== "player") return;

    let target = gameState.enemyBoard[row][col];

    // Prevent clicking the same spot twice
    if (target === "hit" || target === "miss") return;

    if (target === "ship") {
        gameState.enemyBoard[row][col] = "hit"; // Explosion
        messageEl.textContent = "You hit! Attack again."; // Keep this message to allow the player to continue attacking

        // Add Explosion image to the specific cell
        const explosionImg = document.createElement("img");
        explosionImg.src = "./assets/Explosion.png";
        explosionImg.alt = "Explosion";
        enemyCell.appendChild(explosionImg);

        // Do not switch to enemy's turn if the player hits a ship
    } else {
        gameState.enemyBoard[row][col] = "miss"; // Smoke
        messageEl.textContent = "You missed! Enemy's turn...";

        // Add Smoke image to the specific cell
        const smokeImg = document.createElement("img");
        smokeImg.src = "./assets/Smoke.png"; // Same smoke image for both player and enemy
        smokeImg.alt = "Missed shot";
        enemyCell.appendChild(smokeImg);

        gameState.currentTurn = "enemy"; // Switch to enemy's turn
        setTimeout(enemyTurn, 1000); // Delay before the enemy makes its move
    }

    // Check if the game is over after the attack
    checkWin(); 
    render(); // Update board after the attack
}

function enemyTurn() {
    if (gameState.gameOver) return;

    messageEl.textContent = "Enemy is attacking...";

    let row, col;
    do {
        row = Math.floor(Math.random() * BOARD_SIZE);
        col = Math.floor(Math.random() * BOARD_SIZE);
    } while (gameState.playerBoard[row][col] === "hit" || gameState.playerBoard[row][col] === "miss");

    // If the enemy hits
    if (gameState.playerBoard[row][col] === "ship") {
        gameState.playerBoard[row][col] = "hit"; // Mark as hit

        // Access the specific cell in the player board
        const hitCell = playerBoardEl.children[row * BOARD_SIZE + col];
        const explosionImg = document.createElement("img");
        explosionImg.src = "./assets/Explosion.png"; // Explosion effect for enemy hits
        explosionImg.alt = "Explosion";
        hitCell.appendChild(explosionImg); // Add explosion to the cell

        messageEl.textContent = "Enemy hit! Your turn.";
        checkWin(); // Check if the player lost
    } else {
        gameState.playerBoard[row][col] = "miss"; // Mark as miss

        // Access the specific cell in the player board
        const missCell = playerBoardEl.children[row * BOARD_SIZE + col];
        const smokeImg = document.createElement("img");
        smokeImg.src = "./assets/Smoke.png"; // Smoke effect for misses
        smokeImg.alt = "Missed shot";
        missCell.appendChild(smokeImg); // Add smoke to the cell

        messageEl.textContent = "Enemy missed! Your turn.";
    }

    gameState.currentTurn = "player"; // Switch back to player's turn
    render(); // Update the board with the new state
}



function checkWin() {
    // Check if all player ships are hit
    const playerShipsRemaining = gameState.playerBoard.flat().filter(cell => cell === "ship").length;
    if (playerShipsRemaining === 0) {
        gameState.gameOver = true;
        messageEl.textContent = "You lost! The enemy destroyed all your ships.";
    }

    // Check if all enemy ships are hit
    const enemyShipsRemaining = gameState.enemyBoard.flat().filter(cell => cell === "ship").length;
    if (enemyShipsRemaining === 0) {
        gameState.gameOver = true;
        messageEl.textContent = "You won! You destroyed all the enemy's ships.";
    }
}

/*----- Drag & Drop Ships -----*/

// Start dragging a ship
ships.forEach(ship => {
    ship.addEventListener("dragstart", event => {
        draggedShip = {
            size: parseInt(ship.dataset.size),
            element: ship
        };
    });
});

// Allow dropping on player board
playerBoardEl.addEventListener("dragover", event => {
    event.preventDefault();

    const rect = playerBoardEl.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / 50);
    const row = Math.floor((event.clientY - rect.top) / 50);

    highlightPlacement(row, col, draggedShip.size);
});

// Remove highlights when leaving the board
playerBoardEl.addEventListener("dragleave", () => clearHighlights());

// Drop the ship on the board
playerBoardEl.addEventListener("drop", event => {
    event.preventDefault();

    const rect = playerBoardEl.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / 50);
    const row = Math.floor((event.clientY - rect.top) / 50);

    if (canPlaceShip(row, col, draggedShip.size, gameState.playerBoard)) {
        for (let i = 0; i < draggedShip.size; i++) {
            gameState.playerBoard[row][col + i] = "ship";
        }

        draggedShip.element.remove(); // Remove ship from selection
        gameState.playerShipsPlaced++;

        if (gameState.playerShipsPlaced === ships.length) startBtn.disabled = false;
    }

    render();
});

/*----- Ship Placement Helper Functions -----*/

// Highlight valid placement
function highlightPlacement(row, col, size) {
    clearHighlights();

    for (let i = 0; i < size; i++) {
        if (row < BOARD_SIZE && col + i < BOARD_SIZE) {
            const cellIndex = row * BOARD_SIZE + col + i;
            playerBoardEl.children[cellIndex].classList.add("highlight");
        }
    }
}

// Clear highlights
function clearHighlights() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("highlight", "invalid");
    });
}

// Check if a ship can be placed
function canPlaceShip(row, col, size, board) {
    if (col + size > BOARD_SIZE) return false; // Ship out of bounds

    for (let i = 0; i < size; i++) {
        if (board[row][col + i] !== null) return false; // Overlapping another ship
    }
    
    return true;
}

// Start the game
startBtn.addEventListener("click", () => {
    gameState.gameStarted = true;
    messageEl.textContent = "Game started! Attack the enemy board.";
    render();
});

// Reset game
resetBtn.addEventListener("click", init);

// Start game
init();