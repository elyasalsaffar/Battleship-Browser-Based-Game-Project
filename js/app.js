/*-------------------------------- Constants --------------------------------*/

// Definie 5x5 grid board size
const BOARD_SIZE = 5;

/*---------------------------- Variables (state) ----------------------------*/

// Store the current state of the game
const gameState = {
    playerBoard: [],
    enemyBoard: [],
    playerShipsPlaced: 0,
    gameStarted: false,
    currentTurn: "player", // Make sure the game starts with the player's turn
    gameOver: false
};

// Initialize the boards
function initializeBoards() {
    for (let i = 0; i < BOARD_SIZE; i++)
    {
        const row = [];
        for (let j = 0; j < BOARD_SIZE; j++)
        {
            row.push(null);
        }
        gameState.playerBoard.push(row);
        gameState.enemyBoard.push(row);
    }
}

// Call the function to set up the boards
initializeBoards();

let draggedShip = null;

/*------------------------ Cached Element References ------------------------*/

const playerBoardEl = document.getElementById("player-board");
const enemyBoardEl = document.getElementById("enemy-board");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const messageEl = document.getElementById("message");
const ships = document.querySelectorAll(".ship");

/*-------------------------------- Functions --------------------------------*/

// Initialize the game
function init() {
    gameState.playerBoard = createEmptyBoard();
    gameState.enemyBoard = createEmptyBoard();
    gameState.playerShipsPlaced = 0;
    gameState.gameStarted = false;
    gameState.gameOver = false;
    gameState.currentTurn = "player";
    messageEl.textContent = "Drag your ships to the board";
    startBtn.disabled = true;
    startBtn.style.visibility = 'visible'; // Make the start button visible again on reset
    resetBtn.style.visibility = 'hidden'; // Hide the reset button initially
    
    // Re-add ships to the ship container
    const shipsContainer = document.querySelector(".ships-container");
    shipsContainer.innerHTML = `
    <img src="./assets/Battleship-a.png" id="battleship" class="ship" draggable="true" data-size="2">
    <img src="./assets/Battleship-b.png" id="destroyer" class="ship" draggable="true" data-size="2">
    `;

    // Reattach event listeners to new ship elements
    document.querySelectorAll(".ship").forEach(ship => {
        ship.addEventListener("dragstart", event => {
            draggedShip = {
                size: parseInt(ship.dataset.size),
                element: ship
            };
        });
    });

    placeShipsRandomly(gameState.enemyBoard); // Place enemy ships
    render();
}

// Place ships randomly for the enemy player
function placeShipsRandomly(board)
{
    const shipSizes = [2, 2]; // Two ships each with size 2

    shipSizes.forEach(size => {
        let placed = false;

        while (!placed)
        {
            let row = Math.floor(Math.random() * BOARD_SIZE);
            let col = Math.floor(Math.random() * (BOARD_SIZE - size)); // Ensure horizontal fit

            if (canPlaceShip(row, col, size, board))
            {
                for (let i = 0; i < size; i++)
                {
                    board[row][col + i] = "ship"; // Place ship horizontally
                }
                placed = true;
            }
        }
    });
}

// Create an empty board
function createEmptyBoard()
{
    let board = [];
    for (let i = 0; i < BOARD_SIZE; i++)
    {
        let row = [];
        for (let j = 0; j < BOARD_SIZE; j++)
        {
            row.push(null);
        }
        board.push(row);
    }
    return board;
}

// Render the game board
function render()
{
    playerBoardEl.innerHTML = "";
    enemyBoardEl.innerHTML = "";

    for (let r = 0; r < BOARD_SIZE; r++)
    {
        for (let c = 0; c < BOARD_SIZE; c++)
        {
            const playerCell = document.createElement("div");
            const enemyCell = document.createElement("div");

            playerCell.classList.add("cell");
            enemyCell.classList.add("cell");

            // Render player board
            if (gameState.playerBoard[r][c] === "ship")
            {
                playerCell.classList.add("ship");
            } else if (gameState.playerBoard[r][c] === "hit")
            {
                const explosionImg = document.createElement("img");
                explosionImg.src = "./assets/Explosion.png"; // Explosion effect for enemy hits
                explosionImg.alt = "Explosion";
                playerCell.appendChild(explosionImg);
            } else if (gameState.playerBoard[r][c] === "miss")
            {
                const smokeImg = document.createElement("img");
                smokeImg.src = "./assets/Smoke.png"; // Smoke effect for misses
                smokeImg.alt = "Missed shot";
                playerCell.appendChild(smokeImg);
            }

            // Render enemy board
            if (gameState.enemyBoard[r][c] === "hit")
                {
                    const explosionImg = document.createElement("img");
                    explosionImg.src = "./assets/Explosion.png"; // Explosion effect for player's hits
                    explosionImg.alt = "Explosion";
                    enemyCell.appendChild(explosionImg);
                } else if (gameState.enemyBoard[r][c] === "miss")
                {
                    const smokeImg = document.createElement("img");
                    smokeImg.src = "./assets/Smoke.png"; // Smoke effect for player's misses
                    smokeImg.alt = "Missed shot";
                    enemyCell.appendChild(smokeImg);
                } else
                {
                    if (gameState.gameStarted && gameState.currentTurn === "player" && !gameState.gameOver)
                    {
                        enemyCell.addEventListener("click", () => handleAttack(r, c, enemyCell));
                        enemyCell.classList.add("clickable");
                    }
                }

                playerBoardEl.appendChild(playerCell);
                enemyBoardEl.appendChild(enemyCell);
        }
    }
}

// Handle attack
function handleAttack(row, col, enemyCell)
{
    if (!gameState.gameStarted || gameState.gameOver || gameState.currentTurn !== "player") return;

    let target = gameState.enemyBoard[row][col];

    // Prevent clicking the same spot twice
    if (target === "hit" || target === "miss") return;

    if (target === "ship") 
    {
        gameState.enemyBoard[row][col] = "hit"; // Mark as hit
        messageEl.textContent = "You hit! Attack again.";

        // Explosion effect
        const explosionImg = document.createElement("img");
        explosionImg.src = "./assets/Explosion.png";
        explosionImg.alt = "Explosion";
        enemyCell.appendChild(explosionImg);

        checkWin();
    } else
    {
        gameState.enemyBoard[row][col] = "miss"; // Mark as miss
        messageEl.textContent = "You missed! Enemy's turn...";

        // Smoke effect
        const smokeImg = document.createElement("img");
        smokeImg.src = "./assets/Smoke.png";
        smokeImg.alt = "Missed shot";
        enemyCell.appendChild(smokeImg);

        gameState.currentTurn = "enemy"; // Switch turn on miss
        setTimeout(enemyTurn, 1000);
    }
    render();
}

function enemyTurn()
{
    if (gameState.gameOver) return;

    messageEl.textContent = "Enemy is attacking...";

    let row, col;
    do 
    {
        row = Math.floor(Math.random() * BOARD_SIZE);
        col = Math.floor(Math.random() * BOARD_SIZE);
    } while (gameState.playerBoard[row][col] === "hit" || gameState.playerBoard[row][col] === "miss");

    if (gameState.playerBoard[row][col] === "ship")
    {
        gameState.playerBoard[row][col] = "hit"; // Mark as hit

        // Explosion effect for enemy's hit
        const hitCell = playerBoardEl.children[row * BOARD_SIZE + col];
        const explosionImg = document.createElement("img");
        explosionImg.src = "./assets/Explosion.png";
        explosionImg.alt = "Explosion";
        hitCell.appendChild(explosionImg);

        messageEl.textContent = "Enemy hit! Attacking again...";
        checkWin();

        // Allow the enemy to play again if it hits a ship
        setTimeout(enemyTurn, 1000);
    } else
    {
        gameState.playerBoard[row][col] = "miss"; // Mark as miss

        // Smoke effect for enemy's miss
        const missCell = playerBoardEl.children[row *BOARD_SIZE + col];
        const smokeImg = document.createElement("img");
        smokeImg.src = "./assets/Smoke.png";
        smokeImg.alt = "Missed shot";
        missCell.appendChild(smokeImg);

        messageEl.textContent = "Enemy missed! Your turn.";
        gameState.currentTurn = "player"; // Switch back to player
    }
    render();
}

function checkWin()
{
    // Check if all player ships are hit
    const playerShipsRemaining = gameState.playerBoard.flat().filter(cell => cell === "ship").length;
    if (playerShipsRemaining === 0)
    {
        gameState.gameOver = true;
        messageEl.textContent = "You lost! The enemy destroyed all your ships.";
    }

    // Check if all enemy ships are hit
    const enemyShipsRemaining = gameState.enemyBoard.flat().filter(cell => cell === "ship").length;
    if (enemyShipsRemaining === 0)
    {
    gameState.gameOver = true;
    messageEl.textContent = "You won! You destroyed all the enemy's ships.";
    }
}

/*----------------------------- Drag and Drop Ships -------------------------*/


// Start dragging a ship
ships.forEach(ship => {
    ship.addEventListener("dragstart", event => {
        draggedShip = 
        {
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
})

// Remove highlights when leaving the board
// playerBoardEl.addEventListener("dragover", () => clearHighlights());

// Drop the ship on the board
playerBoardEl.addEventListener("drop", event => {
    event.preventDefault();

    const rect = playerBoardEl.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / 50);
    const row = Math.floor((event.clientY - rect.top) / 50);

    if (canPlaceShip(row, col, draggedShip.size, gameState.playerBoard))
    {
        for (let i = 0; i < draggedShip.size; i++)
        {
            gameState.playerBoard[row][col + i] = "ship";
        }

        draggedShip.element.remove(); // Remove the ship from selection
        gameState.playerShipsPlaced++;

        if (gameState.playerShipsPlaced === ships.length) startBtn.disabled = false;
    }
    render();
});

/*----------------------- Ship Placement Helper Functions -------------------*/

// Highlight valid placement
function highlightPlacement(row, col, size)
{
    clearHighlights();

    for (let i = 0; i < size; i++)
    {
        if (row < BOARD_SIZE && col + i < BOARD_SIZE)
        {
            const cellIndex = row * BOARD_SIZE + col + i;
            playerBoardEl.children[cellIndex].classList.add("highlight");
        }
    }
}

// clear highlights
function clearHighlights()
{
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("highlight", "invalid");
    });
}

// Check if a ship can be placed
function canPlaceShip(row, col, size, board)
{
    if (col + size > BOARD_SIZE) return false; // Ship out of bounds

    for (let i = 0; i < size; i++)
    {
        if (board[row][col + i] !== null) return false; // Overlapping another ship
    }
    return true;
}

// Start the game
startBtn.addEventListener("click", () => {
    gameState.gameStarted = true;
    messageEl.textContent = "Game started! Attack the enemy board.";
    startBtn.style.visibility = 'hidden'; // Hide the start button after the game starts
    resetBtn.style.visibility = 'visible'; // Show reset button
    render();
});

// Reset game
resetBtn.addEventListener("click", init);

// Start game
init();