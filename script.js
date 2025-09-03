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

// Punteggio
let score = 0;
const FONT_SIZE = 24;
const FONT_COLOR = 'black';
const FONT_FAMILY = 'Arial';

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
    for (let i = 0; i < NUM_BANANAS; i++) {
        let x = Math.random() * (SCREEN_WIDTH - BANANA_SIZE);
        let y = Math.random() * (SCREEN_HEIGHT - BANANA_SIZE);
        bananas.push({ x: x, y: y, width: BANANA_SIZE, height: BANANA_SIZE });
    }
}

function updateGame() {
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

    // Collisioni con le banane
    let playerRect = { x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE };
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

    // Disegna il punteggio
    ctx.fillStyle = FONT_COLOR;
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillText(`Punteggio: ${score}`, 10, 30); // Posizione in alto a sinistra
}

function loop() {
    updateGame();
    drawGame();
    requestAnimationFrame(loop);
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// --- Event Listeners per il movimento ---
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// --- Inizializzazione ---

// Carica l'avatar del giocatore
playerImage.src = 'assets/faccia.jpg';
playerImage.onload = () => {
    // Carica l'immagine della banana dopo quella del giocatore
    bananaImage.src = 'assets/banana.png';
    bananaImage.onload = () => {
        // Avvia il gioco solo quando entrambe le immagini sono caricate
        placeBananas();
        loop();
    };
    bananaImage.onerror = () => {
        console.error("Errore nel caricamento dell'immagine della banana. Useremo un segnaposto.");
        // Non bloccare il gioco, avvia comunque
        placeBananas();
        loop();
    };
};
playerImage.onerror = () => {
    console.error("Errore nel caricamento dell'immagine del giocatore. Assicurati che 'assets/faccia.jpg' esista e sia un'immagine valida.");
    // Se l'immagine del giocatore non si carica, usa un segnaposto e avvia comunque
    // Nota: in questo caso, playerImage.complete sarà false e disegneremo un fallback.
    // Carica comunque la banana
    bananaImage.src = 'assets/banana.png';
    bananaImage.onload = () => {
        placeBananas();
        loop();
    };
    bananaImage.onerror = () => {
        console.error("Errore nel caricamento dell'immagine della banana. Useremo un segnaposto.");
        placeBananas();
        loop();
    };
};