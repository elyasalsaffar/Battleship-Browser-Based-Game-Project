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
    currentTurn: "player",
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

const playerBoardEL = document.getElementById("player-board");
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

    // Place enemy ships
    placeShipsRandomly(gameState.enemyBoard);
    render();
}

// Place ships randomly for the enemy player
function placeShipsRandomly(board)
{
    const shipSizes = [2, 2]; // Two ships each with 2 cells size

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
    // return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

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
    playerBoardEL.innerHTML = "";
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
            if (gameState.playerBoard[r][c] === "hit")
                {
                    const explosionImg = document.createElement("img");
                    explosionImg.src = "./assets/Explosion.png"; // Explosion effect for player's hits
                    explosionImg.alt = "Explosion";
                    playerCell.appendChild(explosionImg);
                } else if (gameState.enemyBoard[r][c] === "miss")
                {
                    const smokeImg = document.createElement("img");
                    smokeImg.src = "./assets/Smoke.png"; // Smoke effect for player's misses
                    smokeImg.alt = "Missed shot";
                    playerCell.appendChild(smokeImg);
                } else
                {
                    if (gameState.currentTurn === "player" && !gameState.gameOver)
                    {
                        enemyCell.addEventListener("click", () => handleAttack(4, c, enemyCell));
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

}


/*----------------------------- Event Listeners -----------------------------*/
