var canvas;
var canvasContext;
var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;

var player1Score = 0;
var player2Score = 0;
const WINNING_SCORE = 3;

var showingWinScreen = false;

var paddle1Y = 250;
var paddle2Y = 250;
const PADDLE_THICKNESS = 10;
const PADDLE_HEIGHT = 100;
const SPEED_INCREASE = 0.5;

var aiDifficulty = "medium";
var computerSpeed;
var aiErrorMargin;
var gameMode = "ai";

var showingMenu = true;
var mouseX = 0;
var mouseY = 0;

var hitSound = new Audio("hit.wav");
var wallSound = new Audio("wall.wav");
var scoreSound = new Audio("score.wav");
var winSound = new Audio("win.wav");
var clickSound = new Audio("click.wav");

function handleMouseClick(evt) {
    if(showingWinScreen) {

        var mousePos = calculateMousePos(evt);

        var buttonWidth = 200;
        var buttonHeight = 50;
        var buttonX = canvas.width/2 - buttonWidth/2;

        var replayY = 320;
        var menuY = 400;

        // REPLAY BUTTON
        if(mousePos.x > buttonX && mousePos.x < buttonX + buttonWidth &&
        mousePos.y > replayY && mousePos.y < replayY + buttonHeight) {

            clickSound.currentTime = 0;
            clickSound.play();

            player1Score = 0;
            player2Score = 0;
            showingWinScreen = false;

            // reset ball properly
            ballX = canvas.width/2;
            ballY = canvas.height/2;
            ballSpeedX = 10;
            ballSpeedY = 4;
            return;
        }

        // MENU BUTTON
        if(mousePos.x > buttonX && mousePos.x < buttonX + buttonWidth &&
        mousePos.y > menuY && mousePos.y < menuY + buttonHeight) {

            clickSound.currentTime = 0;
            clickSound.play();

            player1Score = 0;
            player2Score = 0;
            showingWinScreen = false;
            showingMenu = true;
            return;
        }
    }

    if(showingMenu) {
        var mousePos = calculateMousePos(evt);

        var buttonWidth = 300;
        var buttonHeight = 40;
        var buttonX = canvas.width/2 - buttonWidth/2;

        var aiButtonY = 250;
        var twoButtonY = 320;

        if(mousePos.x > buttonX && mousePos.x < buttonX + buttonWidth) {

            if(mousePos.y > aiButtonY && mousePos.y < aiButtonY + buttonHeight) {
                clickSound.currentTime = 0;
                clickSound.play();
                gameMode = "ai";
                showingMenu = false;
            }

            if(mousePos.y > twoButtonY && mousePos.y < twoButtonY + buttonHeight) {
                clickSound.currentTime = 0;
                clickSound.play();
                gameMode = "two";
                showingMenu = false;
            }
        }
    }
}

function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return { x:mouseX, y:mouseY };
}

function setAIDifficulty(level) {
    if(level === "easy") {
        computerSpeed = 3;
        aiErrorMargin = 50;
    } else if(level === "medium") {
        computerSpeed = 5;
        aiErrorMargin = 35;
    } else {
        computerSpeed = 8;
        aiErrorMargin = 15;
    }
}

function keyPressed(evt) {
    const moveAmount = 20;

    if(evt.key === 'w') paddle1Y -= moveAmount;
    if(evt.key === 's') paddle1Y += moveAmount;

    if(gameMode === "two") {
        if(evt.key === 'ArrowUp') paddle2Y -= moveAmount;
        if(evt.key === 'ArrowDown') paddle2Y += moveAmount;
    }

    paddle1Y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, paddle1Y));
    paddle2Y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, paddle2Y));
}

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    document.addEventListener('keydown', keyPressed);
    setAIDifficulty(aiDifficulty);

    var framesPerSecond = 30;
    function gameLoop() {
        moveEverything();
        drawEverything();
        requestAnimationFrame(gameLoop);
    }
    gameLoop();

    canvas.addEventListener('mousedown', handleMouseClick);

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = calculateMousePos(evt);
        mouseX = mousePos.x;
        mouseY = mousePos.y;

        if(gameMode === "ai" && !showingMenu) {
            paddle1Y = mousePos.y - (PADDLE_HEIGHT/2);
        }
    });
};

function ballReset() {
    if(player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
        showingWinScreen = true;
        winSound.play();
    }

    ballSpeedX = -ballSpeedX;
    ballSpeedY = (Math.random() * 6) - 3;
    ballX = canvas.width/2;
    ballY = canvas.height/2;
}

function computerMovement() {
    var randomOffset = (Math.random() * aiErrorMargin) - (aiErrorMargin/2);
    var paddle2YCenter = paddle2Y + (PADDLE_HEIGHT/2) + randomOffset;

    if(paddle2YCenter < ballY - aiErrorMargin) {
        paddle2Y += computerSpeed;
    } else if(paddle2YCenter > ballY + aiErrorMargin) {
        paddle2Y -= computerSpeed;
    }

    paddle2Y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, paddle2Y));
}

function moveEverything() {
    if(showingMenu || showingWinScreen) return;

    if(gameMode === "ai") computerMovement();

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if(ballX < 0) {
        if(ballY > paddle1Y && ballY < paddle1Y+PADDLE_HEIGHT) {
            hitSound.currentTime = 0;
            hitSound.play();
            ballSpeedX = -(ballSpeedX + (ballSpeedX > 0 ? SPEED_INCREASE : -SPEED_INCREASE));
            var deltaY = ballY -(paddle1Y+PADDLE_HEIGHT/2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player2Score++;
            scoreSound.currentTime = 0;
            scoreSound.play();
            ballReset();
        }
    }

    if(ballX > canvas.width) {
        if(ballY > paddle2Y && ballY < paddle2Y+PADDLE_HEIGHT) {
            hitSound.currentTime = 0;
            hitSound.play();
            ballSpeedX = -(ballSpeedX + (ballSpeedX > 0 ? SPEED_INCREASE : -SPEED_INCREASE));
            var deltaY = ballY -(paddle2Y+PADDLE_HEIGHT/2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player1Score++;
            ballReset();
        }
    }

    if(ballY < 0 || ballY > canvas.height) {
        ballSpeedY = -ballSpeedY;
        wallSound.currentTime = 0;
        wallSound.play();
    }
}

function drawNet() {
    for(var i=0;i<canvas.height;i+=40) {
        colorRect(canvas.width/2-1,i,2,20,'#e2e8f0');
    }
}

function drawEverything() {
    canvasContext.fillStyle = "rgba(0,0,0,0.25)";
    canvasContext.fillRect(0,0,canvas.width,canvas.height);
    canvasContext.font = "20px Arial";
    canvasContext.fillStyle = "#e2e8f0";
    canvasContext.textAlign = "left";

    if(showingMenu) {
        canvasContext.save();

        canvasContext.textAlign = "center";

        canvasContext.fillStyle = "white";
        canvasContext.font = "32px Arial";
        canvasContext.fillText("Select Game Mode", canvas.width/2, 180);

        var buttonWidth = 300;
        var buttonHeight = 50;
        var buttonX = canvas.width/2 - buttonWidth/2;

        // ===== AI BUTTON =====
        var aiButtonY = 250;

        if(mouseX > buttonX && mouseX < buttonX + buttonWidth &&
        mouseY > aiButtonY && mouseY < aiButtonY + buttonHeight) {
            colorRect(buttonX, aiButtonY, buttonWidth, buttonHeight, '#38bdf8');
        } else {
            colorRect(buttonX, aiButtonY, buttonWidth, buttonHeight, '#e2e8f0');
        }

        canvasContext.fillStyle = "black";
        canvasContext.font = "20px Arial";
        canvasContext.fillText("Player vs Computer", canvas.width/2, aiButtonY + 32);

        // ===== TWO PLAYER BUTTON =====
        var twoButtonY = 330;

        if(mouseX > buttonX && mouseX < buttonX + buttonWidth &&
        mouseY > twoButtonY && mouseY < twoButtonY + buttonHeight) {
            colorRect(buttonX, twoButtonY, buttonWidth, buttonHeight, '#38bdf8');
        } else {
            colorRect(buttonX, twoButtonY, buttonWidth, buttonHeight, '#e2e8f0');
        }

        canvasContext.fillStyle = "black";
        canvasContext.fillText("Two Player Mode", canvas.width/2+2, twoButtonY + 32);

        canvasContext.fillStyle = "white";
        canvasContext.font = "16px Arial";
        canvasContext.fillText("Click an option to start", canvas.width/2+2, 420);

        canvasContext.restore();

        return;
    }

    if(showingWinScreen) {
        canvasContext.save(); // ✅ SAVE state
        canvasContext.fillStyle = "rgba(0,0,0,0.7)";
        canvasContext.fillRect(0,0,canvas.width,canvas.height);

        canvasContext.fillStyle = "white";
        canvasContext.textAlign = "center";

        // ===== WINNER TEXT =====
        canvasContext.font = "36px Arial";

        if(player1Score >= WINNING_SCORE) {
            canvasContext.fillText("🏆 Player 1 Wins!", canvas.width/2, 180);
        } else {
            canvasContext.fillText("🏆 Player 2 Wins!", canvas.width/2, 180);
        }

        // ===== SCORE DISPLAY =====
        canvasContext.font = "24px Arial";
        canvasContext.fillText(
            "Final Score: " + player1Score + " - " + player2Score,
            canvas.width/2,
            240
        );

        // ===== BUTTONS =====
        var buttonWidth = 200;
        var buttonHeight = 50;
        var buttonX = canvas.width/2 - buttonWidth/2;

        var replayY = 320;
        var menuY = 400;

        // Replay Button
        if(mouseX > buttonX && mouseX < buttonX + buttonWidth &&
        mouseY > replayY && mouseY < replayY + buttonHeight) {
            colorRect(buttonX, replayY, buttonWidth, buttonHeight, '#38bdf8');
        } else {
            colorRect(buttonX, replayY, buttonWidth, buttonHeight, '#e2e8f0');
        }
    
        canvasContext.fillStyle = "black";
        canvasContext.font = "20px Arial";
        canvasContext.fillText("🔁 Replay", canvas.width/2, replayY + 32);

        // Menu Button
        if(mouseX > buttonX && mouseX < buttonX + buttonWidth &&
        mouseY > menuY && mouseY < menuY + buttonHeight) {
            colorRect(buttonX, menuY, buttonWidth, buttonHeight, '#38bdf8');
        } else {
            colorRect(buttonX, menuY, buttonWidth, buttonHeight, '#e2e8f0');
        }

        canvasContext.fillStyle = "black";
        canvasContext.fillText("🏠 Main Menu", canvas.width/2, menuY + 32);

        return;
    }

    drawNet();

    colorRect(0,paddle1Y,PADDLE_THICKNESS,PADDLE_HEIGHT,'white');
    colorRect(canvas.width-PADDLE_THICKNESS,paddle2Y,PADDLE_THICKNESS,PADDLE_HEIGHT,'white');

    colorCircle(ballX, ballY, 10, '#e2e8f0');

    canvasContext.fillText(player1Score, 100, 100);
    canvasContext.fillText(player2Score, canvas.width-100, 100);
}

function colorCircle(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle = drawColor;

    canvasContext.shadowBlur = 15;
    canvasContext.shadowColor = "white";

    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();

    canvasContext.shadowBlur = 0; // reset
}

function colorRect(leftX,topY, width,height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX,topY, width,height);
}