// 获取画布和上下文
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// 获取按钮和分数元素
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

// 游戏设置
const gridSize = 20; // 网格大小
const tileCount = canvas.width / gridSize; // 网格数量

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// 设置初始高分
highScoreElement.textContent = highScore;

// 蛇的初始位置和速度
let snake = [
    { x: 10, y: 10 } // 蛇头
];
let velocityX = 0;
let velocityY = 0;
let lastVelocityX = 0;
let lastVelocityY = 0;

// 食物初始位置
let food = {
    x: 5,
    y: 5
};

// 游戏循环
let gameInterval;

// 初始化游戏
function initGame() {
    // 重置蛇
    snake = [
        { x: 10, y: 10 }
    ];
    
    // 重置速度
    velocityX = 0;
    velocityY = 0;
    lastVelocityX = 0;
    lastVelocityY = 0;
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成新食物
    generateFood();
    
    // 重置游戏状态
    gameOver = false;
    gamePaused = false;
    
    // 更新按钮状态
    updateButtonStates();
}

// 开始游戏
function startGame() {
    if (!gameRunning && !gameOver) {
        gameRunning = true;
        gameInterval = setInterval(gameLoop, 100); // 每100毫秒更新一次游戏
        updateButtonStates();
        SoundManager.play('start');
    }
}

// 暂停游戏
function pauseGame() {
    if (gameRunning && !gameOver) {
        if (gamePaused) {
            // 恢复游戏
            gamePaused = false;
            gameInterval = setInterval(gameLoop, 100);
            pauseBtn.textContent = '暂停';
        } else {
            // 暂停游戏
            gamePaused = true;
            clearInterval(gameInterval);
            pauseBtn.textContent = '继续';
        }
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    initGame();
    // 自动重新开始游戏
    startGame();
}

// 更新按钮状态
function updateButtonStates() {
    startBtn.disabled = gameRunning;
    pauseBtn.disabled = !gameRunning || gameOver;
    restartBtn.disabled = false;
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let newFoodPosition;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFoodPosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // 检查食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFoodPosition.x && snake[i].y === newFoodPosition.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFoodPosition;
}

// 游戏主循环
function gameLoop() {
    if (gamePaused || gameOver) return;
    
    // 更新蛇的位置
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver = true;
        gameRunning = false;
        clearInterval(gameInterval);
        updateButtonStates();
        drawGame(); // 最后一次绘制，显示游戏结束状态
        return;
    }
    
    // 检查是否吃到食物
    checkFood();
    
    // 绘制游戏
    drawGame();
    
    // 保存当前速度
    lastVelocityX = velocityX;
    lastVelocityY = velocityY;
}

// 移动蛇
function moveSnake() {
    // 创建新的蛇头
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    
    // 将新蛇头添加到蛇身前面
    snake.unshift(head);
    
    // 如果没有吃到食物，移除蛇尾
    if (!(head.x === food.x && head.y === food.y)) {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        SoundManager.play('gameOver');
        return true;
    }
    
    // 检查是否撞到自己的身体
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            SoundManager.play('gameOver');
            return true;
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score++;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 播放吃食物音效
        SoundManager.play('eat');
        
        // 生成新食物
        generateFood();
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头为深绿色，蛇身为绿色
        ctx.fillStyle = index === 0 ? '#388E3C' : '#4CAF50';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 绘制蛇身边框
        ctx.strokeStyle = '#e8f5e9';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // 如果游戏结束，显示游戏结束文字
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

// 键盘控制
function handleKeyDown(e) {
    // 如果游戏未运行或已结束，不处理按键
    if (!gameRunning || gameOver) return;
    
    let directionChanged = false;
    
    // 根据按键设置速度
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            // 防止直接反向移动
            if (lastVelocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
                directionChanged = true;
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (lastVelocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
                directionChanged = true;
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (lastVelocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
                directionChanged = true;
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (lastVelocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
                directionChanged = true;
            }
            break;
    }
    
    // 如果方向改变，播放移动音效
    if (directionChanged) {
        SoundManager.play('move');
    }
}

// 添加触摸控制（适用于移动设备）
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!gameRunning || gameOver) return;
    
    e.preventDefault();
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // 确定滑动方向（水平或垂直）
    if (Math.abs(dx) > Math.abs(dy)) {
        // 水平滑动
        if (dx > 0 && lastVelocityX !== -1) {
            // 向右滑动
            velocityX = 1;
            velocityY = 0;
        } else if (dx < 0 && lastVelocityX !== 1) {
            // 向左滑动
            velocityX = -1;
            velocityY = 0;
        }
    } else {
        // 垂直滑动
        if (dy > 0 && lastVelocityY !== -1) {
            // 向下滑动
            velocityX = 0;
            velocityY = 1;
        } else if (dy < 0 && lastVelocityY !== 1) {
            // 向上滑动
            velocityX = 0;
            velocityY = -1;
        }
    }
    
    // 更新触摸起始位置
    touchStartX = touchEndX;
    touchStartY = touchEndY;
}

// 事件监听
document.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// 初始化音效
SoundManager.init();

// 添加音效开关事件监听
document.getElementById('sound-toggle').addEventListener('click', function() {
    SoundManager.toggleSound();
});

// 初始化游戏
initGame();

// 初始绘制游戏
drawGame();