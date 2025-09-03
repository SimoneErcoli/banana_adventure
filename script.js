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

// Fragolina
let strawberryImage = new Image();
const STRAWBERRY_SIZE = 30;
let strawberryX, strawberryY;
let strawberrySpeedX, strawberrySpeedY;
const STRAWBERRY_BASE_SPEED = 3; // Velocità base della fragolina
const RED = 'rgb(255, 0, 0)'; // Colore per la fragolina di fallback

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
        // Controlla che non si sovrapponga a cetrioli o fragolina già esistenti
        for (let cucumber of cucumbers) {
            if (checkCollision(newBanana, cucumber)) {
                overlap = true;
                break;
            }
        }
        if (!overlap && strawberryX !== undefined) { // Controlla anche la fragolina se è già posizionata
            if (checkCollision(newBanana, { x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE })) {
                overlap = true;
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
        // Controlla che non si sovrapponga a banane o fragolina già esistenti
        for (let banana of bananas) {
            if (checkCollision(newCucumber, banana)) {
                overlap = true;
                break;
            }
        }
        if (!overlap && strawberryX !== undefined) { // Controlla anche la fragolina se è già posizionata
            if (checkCollision(newCucumber, { x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE })) {
                overlap = true;
            }
        }
        if (!overlap && !checkCollision(newCucumber, { x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE })) {
            cucumbers.push(newCucumber);
        }
    }
}

function placeStrawberry() {
    // Posiziona la fragolina in una posizione casuale iniziale
    strawberryX = Math.random() * (SCREEN_WIDTH - STRAWBERRY_SIZE);
    strawberryY = Math.random() * (SCREEN_HEIGHT - STRAWBERRY_SIZE);

    // Dà una velocità iniziale casuale
    strawberrySpeedX = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
    strawberrySpeedY = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
}

function resetGame() {
    gameOver = false;
    score = 0;
    playerX = (SCREEN_WIDTH - PLAYER_SIZE) / 2;
    playerY = (SCREEN_HEIGHT - PLAYER_SIZE) / 2;
    placeStrawberry(); // Prima la fragolina (per non sovrapporla)
    placeBananas();    // Poi le banane
    placeCucumbers();  // Poi i cetrioli
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

    // --- Movimento della fragolina ---
    strawberryX += strawberrySpeedX;
    strawberryY += strawberrySpeedY;

    // Rimbalzo sui bordi per la fragolina
    if (strawberryX + STRAWBERRY_SIZE > SCREEN_WIDTH || strawberryX < 0) {
        strawberrySpeedX *= -1;
    }
    if (strawberryY + STRAWBERRY_SIZE > SCREEN_HEIGHT || strawberryY < 0) {
        strawberrySpeedY *= -1;
    }

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

    // Se tutte le banane sono state raccolte, riposizionale e anche i cetrioli
    if (bananas.length === 0) {
        placeBananas();
        placeCucumbers(); // Riposiziona anche i cetrioli
    }

    // Collisioni con i cetrioli
    for (let cucumber of cucumbers) {
        if (checkCollision(playerRect, cucumber)) {
            gameOver = true;
            break;
        }
    }

    // Collisioni con la fragolina
    let strawberryRect = { x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE };
    if (checkCollision(playerRect, strawberryRect)) {
        gameOver = true;
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

    // Disegna la fragolina
    if (strawberryImage.complete && strawberryImage.naturalWidth > 0) {
        ctx.drawImage(strawberryImage, strawberryX, strawberryY, STRAWBERRY_SIZE, STRAWBERRY_SIZE);
    } else {
        // Disegna un cerchio rosso come fallback
        ctx.fillStyle = RED;
        ctx.beginPath();
        ctx.arc(strawberryX + STRAWBERRY_SIZE / 2, strawberryY + STRAWBERRY_SIZE / 2, STRAWBERRY_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }

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
const totalImages = 4; // player, banana, cucumber, strawberry

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        resetGame(); // Inizializza il gioco (posiziona banane, cetrioli, fragolina)
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

strawberryImage.src = 'assets/fragolina.png';
strawberryImage.onload = imageLoaded;
strawberryImage.onerror = () => {
    console.error("Errore caricamento immagine fragolina.");
    imageLoaded(); // Conta come caricata anche se con errore
};