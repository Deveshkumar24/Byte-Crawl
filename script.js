const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");
const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");


const blockHeight = 35;
const blockWidth = 35;

// GAME STATE VARIABLES
let highScore = 0;
let score = 0;
let timeInSeconds = 0; // Timer tracking in seconds
let gameSpeed = 300;

highScoreElement.innerText = highScore;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timerIntervalId = null;

// GAME OBJECTS
let food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)};
const blocks = [];
let snake = [{x:1, y:3}]; 
let direction = 'down';

// CREATE GAME BOARD GRID
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div');
        block.classList.add("block");
        board.appendChild(block);
        blocks[`${row}-${col}`] = block;
    }
}

// MAIN GAME RENDER FUNCTION
function render() {
    let head = null;
    blocks[`${food.x}-${food.y}`].classList.add("food");

    // Calculate new head position based on direction
    if (direction === "left") {
        head = {x: snake[0].x, y: snake[0].y - 1};
    } else if (direction === "right") {
        head = {x: snake[0].x, y: snake[0].y + 1};
    } else if (direction === "up") {
        head = {x: snake[0].x - 1, y: snake[0].y};
    } else if (direction === "down") {
        head = {x: snake[0].x + 1, y: snake[0].y};
    }

    // COLLISION DETECTION - Wall boundaries
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalId);
        clearInterval(timerIntervalId);
        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex";
        return;
    }

    // COLLISION DETECTION - Snake hits itself
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            clearInterval(intervalId);
            clearInterval(timerIntervalId);
            modal.style.display = "flex";
            startGameModal.style.display = "none";
            gameOverModal.style.display = "flex";
            return;
        }
    }

    // FOOD COLLISION DETECTION
    if (head.x === food.x && head.y === food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)};
        blocks[`${food.x}-${food.y}`].classList.add("food");
        
        // Add new head 
        snake.unshift(head);
        
        // Increase score
        score++;
        scoreElement.innerText = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.innerText = highScore;
        }

        // PROGRESSIVE DIFFICULTY - Increase speed every 5 points
        if (score % 5 === 0 && gameSpeed > 100) {
            gameSpeed -= 30;
            clearInterval(intervalId);
            intervalId = setInterval(() => { render() }, gameSpeed);
        }
    }

    // Clear previous snake positions from board
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    });

    // Move snake - add new head and remove tail (if no food was eaten)
    snake.unshift(head);
    snake.pop();
    
    // Render current snake positions on board
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    });
}

// FORMAT TIME to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// START GAME
startButton.addEventListener('click', () => {
    modal.style.display = "none";
    intervalId = setInterval(() => { render() }, gameSpeed);
    
    // TIMER - Fixed to work properly
    timerIntervalId = setInterval(() => {
        timeInSeconds++;
        timeElement.innerText = formatTime(timeInSeconds);
    }, 1000);
});

// RESTART GAME
restartButton.addEventListener('click', restartGame);

function restartGame() {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    });
    
    score = 0;
    timeInSeconds = 0;
    gameSpeed = 300; // Reset to initial speed

    scoreElement.innerText = score;
    timeElement.innerText = formatTime(timeInSeconds);
    highScoreElement.innerText = highScore;

    modal.style.display = "none";
    direction = "down";
    snake = [{x:1, y:3}];
    food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)};
    
    intervalId = setInterval(() => { render() }, gameSpeed);
    timerIntervalId = setInterval(() => {
        timeInSeconds++;
        timeElement.innerText = formatTime(timeInSeconds);
    }, 1000);
}

// KEYBOARD CONTROLS
addEventListener('keydown', (event) => {
    if (event.key.startsWith('Arrow')) {
        event.preventDefault();
    }
    
    if (event.key === "ArrowLeft") {
        direction = "left";
    } else if (event.key === "ArrowRight") {
        direction = "right";
    } else if (event.key === "ArrowUp") {
        direction = "up";
    } else if (event.key === "ArrowDown") {
        direction = "down";
    }
});

render();