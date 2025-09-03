const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

// Giocatore
let playerImage = new Image();
const PLAYER_SIZE = 50;
let playerX = (SCREEN_WIDTH - PLAYER_SIZE) / 2;
let playerY = (SCREEN_HEIGHT - PLAYER_SIZE) / 2;
const playerSpeed = 5;

// Banane
let bananaImage = new Image();
const BANANA_SIZE = 40;
let bananas = [];
const NUM_BANANAS = 10;
const YELLOW = 'rgb(255, 255, 0)'; // Colore per la banana di fallback

// Cetrioli
let cucumberImage = new Image();
const CUCUMBER_SIZE = 40;
let cucumbers = [];
const NUM_CUCUMBERS = 5;
const GREEN = 'rgb(0, 128, 0)'; // Colore per il cetriolo di fallback

// Punteggio
let score = 0;
const FONT_SIZE = 24;
const FONT_COLOR = 'black';
const FONT_FAMILY = 'Arial';

// Stato del gioco
let gameOver = false;

// Gestione dei tasti premuti per il movimento continuo
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// --- Funzioni di gioco ---

function placeBananas() {
    bananas = [];
    while (bananas.length < NUM_BANANAS) {
        let x = Math.random() * (SCREEN_WIDTH - BANANA_SIZE);
        let y = Math.random() * (SCREEN_HEIGHT - BANANA_SIZE);
        let newBanana = { x: x, y: y, width: BANANA_SIZE, height: BANANA_SIZE };
        let overlap = false;
        // Controlla che non si sovrapponga a cetrioli già esistenti
        for (let cucumber of cucumbers) {
            if (checkCollision(newBanana, cucumber)) {
                overlap = true;
                break;
            }
        }
        if (!overlap && !checkCollision(newBanana, { x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE })) {
            bananas.push(newBanana);
        }
    }
}

function placeCucumbers() {
    cucumbers = [];
    while (cucumbers.length < NUM_CUCUMBERS) {
        let x = Math.random() * (SCREEN_WIDTH - CUCUMBER_SIZE);
        let y = Math.random() * (SCREEN_HEIGHT - CUCUMBER_SIZE);
        let newCucumber = { x: x, y: y, width: CUCUMBER_SIZE, height: CUCUMBER_SIZE };
        let overlap = false;
        // Controlla che non si sovrapponga a banane già esistenti o al giocatore
        for (let banana of bananas) {
            if (checkCollision(newCucumber, banana)) {
                overlap = true;
                break;
            }
        }
        if (!overlap && !checkCollision(newCucumber, { x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE })) {
            cucumbers.push(newCucumber);
        }
    }
}

function resetGame() {
    gameOver = false;
    score = 0;
    playerX = (SCREEN_WIDTH - PLAYER_SIZE) / 2;
    playerY = (SCREEN_HEIGHT - PLAYER_SIZE) / 2;
    placeBananas(); // Prima le banane
    placeCucumbers(); // Poi i cetrioli, evitando le banane
}

function updateGame() {
    if (gameOver) return;

    // Aggiorna posizione giocatore in base ai tasti premuti
    if (keys.ArrowUp) {
        playerY -= playerSpeed;
    }
    if (keys.ArrowDown) {
        playerY += playerSpeed;
    }
    if (keys.ArrowLeft) {
        playerX -= playerSpeed;
    }
    if (keys.ArrowRight) {
        playerX += playerSpeed;
    }

    // Limiti della schermata per il giocatore
    playerX = Math.max(0, Math.min(playerX, SCREEN_WIDTH - PLAYER_SIZE));
    playerY = Math.max(0, Math.min(playerY, SCREEN_HEIGHT - PLAYER_SIZE));

    let playerRect = { x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE };

    // Collisioni con le banane
    let bananasToRemove = [];
    bananas.forEach((banana, index) => {
        if (checkCollision(playerRect, banana)) {
            bananasToRemove.push(index);
            score += 1;
        }
    });

    // Rimuovi le banane raccolte (dal più grande indice al più piccolo per evitare problemi di indice)
    for (let i = bananasToRemove.length - 1; i >= 0; i--) {
        bananas.splice(bananasToRemove[i], 1);
    }

    // Se tutte le banane sono state raccolte, riposizionale
    if (bananas.length === 0) {
        placeBananas();
    }

    // Collisioni con i cetrioli
    for (let cucumber of cucumbers) {
        if (checkCollision(playerRect, cucumber)) {
            gameOver = true;
            break;
        }
    }
}

function drawGame() {
    // Pulisce la canvas
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Disegna il giocatore
    ctx.drawImage(playerImage, playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);

    // Disegna le banane
    bananas.forEach(banana => {
        if (bananaImage.complete && bananaImage.naturalWidth > 0) {
            ctx.drawImage(bananaImage, banana.x, banana.y, banana.width, banana.height);
        } else {
            // Disegna un cerchio giallo come fallback
            ctx.fillStyle = YELLOW;
            ctx.beginPath();
            ctx.arc(banana.x + banana.width / 2, banana.y + banana.height / 2, banana.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Disegna i cetrioli
    cucumbers.forEach(cucumber => {
        if (cucumberImage.complete && cucumberImage.naturalWidth > 0) {
            ctx.drawImage(cucumberImage, cucumber.x, cucumber.y, cucumber.width, cucumber.height);
        } else {
            // Disegna un cerchio verde come fallback
            ctx.fillStyle = GREEN;
            ctx.beginPath();
            ctx.arc(cucumber.x + cucumber.width / 2, cucumber.y + cucumber.height / 2, cucumber.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Disegna il punteggio
    ctx.fillStyle = FONT_COLOR;
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillText(`Punteggio: ${score}`, 10, 30); // Posizione in alto a sinistra

    // Messaggio di Game Over
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = `48px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER!", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 24);
        ctx.font = `24px ${FONT_FAMILY}`;
        ctx.fillText("Premi 'R' per riavviare", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 24);
        ctx.textAlign = 'left'; // Reset per altri testi
    }
}

function loop() {
    updateGame();
    drawGame();
    if (!gameOver) {
        requestAnimationFrame(loop);
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// --- Event Listeners per il movimento e il riavvio ---
window.addEventListener('keydown', (e) => {
    if (gameOver && e.key === 'r') {
        resetGame();
        loop(); // Avvia un nuovo ciclo di gioco
    } else if (!gameOver && keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// --- Inizializzazione ---

// Carica tutte le immagini e poi avvia il gioco
let imagesLoaded = 0;
const totalImages = 3; // player, banana, cucumber

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        resetGame(); // Inizializza il gioco (posiziona banane e cetrioli)
        loop();     // Avvia il game loop
    }
}

playerImage.src = 'assets/faccia.jpg';
playerImage.onload = imageLoaded;
playerImage.onerror = () => {
    console.error("Errore caricamento immagine giocatore.");
    imageLoaded(); // Conta come caricata anche se con errore
};

bananaImage.src = 'assets/banana.png';
bananaImage.onload = imageLoaded;
bananaImage.onerror = () => {
    console.error("Errore caricamento immagine banana.");
    imageLoaded(); // Conta come caricata anche se con errore
};

cucumberImage.src = 'assets/cetriolo.png';
cucumberImage.onload = imageLoaded;
cucumberImage.onerror = () => {
    console.error("Errore caricamento immagine cetriolo.");
    imageLoaded(); // Conta come caricata anche se con errore
};