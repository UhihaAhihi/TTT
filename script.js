const board = document.getElementById('game-board');
const resetButton = document.getElementById('reset-button');
const statusDisplay = document.getElementById('status');
const difficultySelect = document.getElementById('difficulty');

let currentPlayer = 'X';
let gameActive = true;
let gameState = Array(25).fill('');

const updateStatus = () => {
    const status = gameActive ? `Người chơi ${currentPlayer}'s lượt` : `Người chơi ${currentPlayer} đã thắng!`;
    statusDisplay.innerText = status;
};

const checkWinner = () => {
    const winConditions = [];

    // Horizontal
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 2; col++) {
            winConditions.push([row * 5 + col, row * 5 + col + 1, row * 5 + col + 2, row * 5 + col + 3]);
        }
    }

    // Vertical
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 2; row++) {
            winConditions.push([row * 5 + col, (row + 1) * 5 + col, (row + 2) * 5 + col, (row + 3) * 5 + col]);
        }
    }

    // Diagonal (top-left to bottom-right)
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            winConditions.push([row * 5 + col, (row + 1) * 5 + col + 1, (row + 2) * 5 + col + 2, (row + 3) * 5 + col + 3]);
        }
    }

    // Diagonal (top-right to bottom-left)
    for (let row = 0; row < 2; row++) {
        for (let col = 3; col < 5; col++) {
            winConditions.push([row * 5 + col, (row + 1) * 5 + col - 1, (row + 2) * 5 + col - 2, (row + 3) * 5 + col - 3]);
        }
    }

    for (let condition of winConditions) {
        const [a, b, c, d] = condition;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c] && gameState[a] === gameState[d]) {
            gameActive = false;
            return true;
        }
    }
    return false;
};

const handleCellClick = (event) => {
    const clickedCell = event.target;
    const clickedCellIndex = Array.from(clickedCell.parentNode.children).indexOf(clickedCell);

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;

    if (checkWinner()) {
        updateStatus();
        return;
    }

    currentPlayer = 'O'; // Bot sẽ là O
    updateStatus();
    botMove();
};

const botMove = () => {
    if (!gameActive) return;

    let move;
    const difficulty = difficultySelect.value;

    if (difficulty === 'easy') {
        move = easyBotMove();
    } else if (difficulty === 'medium') {
        move = mediumBotMove();
    } else {
        move = hardBotMove();
    }

    gameState[move] = currentPlayer;
    document.querySelectorAll('.cell')[move].innerText = currentPlayer;

    if (checkWinner()) {
        updateStatus();
        return;
    }

    currentPlayer = 'X'; // Người chơi sẽ là X
    updateStatus();
};

const easyBotMove = () => {
    const emptyCells = gameState.map((value, index) => value === '' ? index : null).filter(index => index !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const mediumBotMove = () => {
    const winningMove = findWinningMove('O');
    if (winningMove !== null) return winningMove;

    const blockingMove = findWinningMove('X');
    if (blockingMove !== null) return blockingMove;

    return easyBotMove();
};

const hardBotMove = () => {
    return minimax(gameState, 'O').index;
};

const findWinningMove = (player) => {
    for (let i = 0; i < 25; i++) {
        if (gameState[i] === '') {
            gameState[i] = player;
            if (checkWinner()) {
                gameState[i] = '';
                return i;
            }
            gameState[i] = '';
        }
    }
    return null;
};

const minimax = (newState, player) => {
    const availableMoves = newState.map((val, index) => (val === '' ? index : null)).filter(val => val !== null);

    if (checkWinner()) {
        return { score: player === 'O' ? -1 : 1 };
    } else if (availableMoves.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availableMoves.length; i++) {
        const move = availableMoves[i];
        newState[move] = player;

        const result = minimax(newState, player === 'O' ? 'X' : 'O');
        moves.push({ index: move, score: result.score });
        newState[move] = '';
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
};

const resetGame = () => {
    gameActive = true;
    currentPlayer = 'X';
    gameState = Array(25).fill('');
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = '');
    statusDisplay.innerText = `Người chơi ${currentPlayer}'s lượt`;
};

const createBoard = () => {
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
};

createBoard();
updateStatus();

resetButton.addEventListener('click', resetGame);
