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

// Patata
let potatoImage = new Image();
const POTATO_SIZE = 45;
let potatoX, potatoY;
const POTATO_SPEED = 2; // Velocità di caduta della patata
const BROWN = 'rgb(139, 69, 19)'; // Colore per la patata di fallback

// Punteggio e conteggi
let bananasCollected = 0; // Nuovo contatore per le banane
let cucumbersCollected = 0; // Nuovo contatore per i cetrioli
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

// --- Funzioni di utilità per le collisioni ---
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Funzione generica per trovare una posizione non sovrapposta
function findNonOverlappingPosition(size, excludeRects = [], isFalling = false) {
    let newRect;
    let overlap;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    do {
        overlap = false;
        // Se l'oggetto cade, lo posizioniamo solo in alto
        if (isFalling) {
            newRect = {
                x: Math.random() * (SCREEN_WIDTH - size),
                y: -size, // Inizia fuori dallo schermo in alto
                width: size,
                height: size
            };
        } else {
            newRect = {
                x: Math.random() * (SCREEN_WIDTH - size),
                y: Math.random() * (SCREEN_HEIGHT - size),
                width: size,
                height: size
            };
        }

        for (let excludeRect of excludeRects) {
            if (checkCollision(newRect, excludeRect)) {
                overlap = true;
                break;
            }
        }
        attempts++;
    } while (overlap && attempts < MAX_ATTEMPTS);

    return newRect;
}


// --- Funzioni di gioco ---

function placeBananas() {
    bananas = [];
    while (bananas.length < NUM_BANANAS) {
        let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                                .concat(cucumbers)
                                .concat([{ x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE }])
                                .concat([{ x: potatoX, y: potatoY, width: POTATO_SIZE, height: POTATO_SIZE }]);
        let newBananaRect = findNonOverlappingPosition(BANANA_SIZE, excludeRects);
        if (newBananaRect) {
            bananas.push(newBananaRect);
        }
    }
}

function placeCucumbers() {
    cucumbers = [];
    while (cucumbers.length < NUM_CUCUMBERS) {
        let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                                .concat(bananas)
                                .concat([{ x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE }])
                                .concat([{ x: potatoX, y: potatoY, width: POTATO_SIZE, height: POTATO_SIZE }]);
        let newCucumberRect = findNonOverlappingPosition(CUCUMBER_SIZE, excludeRects);
        if (newCucumberRect) {
            cucumbers.push(newCucumberRect);
        }
    }
}

function placeStrawberry() {
    let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                            .concat(bananas)
                            .concat(cucumbers)
                            .concat([{ x: potatoX, y: potatoY, width: POTATO_SIZE, height: POTATO_SIZE }]);
    let newStrawberryRect = findNonOverlappingPosition(STRAWBERRY_SIZE, excludeRects);
    if (newStrawberryRect) {
        strawberryX = newStrawberryRect.x;
        strawberryY = newStrawberryRect.y;
    } else { // Fallback se non trova una posizione, la mette al centro
        strawberryX = (SCREEN_WIDTH - STRAWBERRY_SIZE) / 2;
        strawberryY = (SCREEN_HEIGHT - STRAWBERRY_SIZE) / 2;
    }

    // Dà una velocità iniziale casuale
    strawberrySpeedX = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
    strawberrySpeedY = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
}

function placePotato() {
    let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                            .concat(bananas)
                            .concat(cucumbers)
                            .concat([{ x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE }]);
    let newPotatoRect = findNonOverlappingPosition(POTATO_SIZE, excludeRects, true); // true per isFalling
    if (newPotatoRect) {
        potatoX = newPotatoRect.x;
        potatoY = newPotatoRect.y;
    } else { // Fallback
        potatoX = Math.random() * (SCREEN_WIDTH - POTATO_SIZE);
        potatoY = -POTATO_SIZE;
    }
}

function resetGame() {
    gameOver = false;
    bananasCollected = 0; // Reset del contatore banane
    cucumbersCollected = 0; // Reset del contatore cetrioli
    playerX = (SCREEN_WIDTH - PLAYER_SIZE) / 2;
    playerY = (SCREEN_HEIGHT - PLAYER_SIZE) / 2;
    
    // Reset di tutti gli oggetti in un ordine che evita sovrapposizioni iniziali
    placePotato();
    placeStrawberry();
    placeBananas();
    placeCucumbers();
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

    // --- Movimento della patata ---
    potatoY += POTATO_SPEED;
    if (potatoY > SCREEN_HEIGHT) {
        placePotato(); // Riposiziona la patata in alto quando esce dallo schermo
    }


    // Collisioni con le banane
    let bananasToRemove = [];
    bananas.forEach((banana, index) => {
        if (checkCollision(playerRect, banana)) {
            bananasToRemove.push(index);
            bananasCollected += 1; // Incrementa il contatore delle banane
        }
    });

    // Rimuovi le banane raccolte (dal più grande indice al più piccolo per evitare problemi di indice)
    for (let i = bananasToRemove.length - 1; i >= 0; i--) {
        bananas.splice(bananasToRemove[i], 1);
    }

    // Collisioni con i cetrioli
    let cucumbersToRemove = [];
    cucumbers.forEach((cucumber, index) => {
        if (checkCollision(playerRect, cucumber)) {
            cucumbersToRemove.push(index);
            cucumbersCollected += 1; // Incrementa il contatore dei cetrioli
        }
    });

    // Rimuovi i cetrioli raccolti
    for (let i = cucumbersToRemove.length - 1; i >= 0; i--) {
        cucumbers.splice(cucumbersToRemove[i], 1);
    }

    // --- Logica di rigenerazione combinata per banane e cetrioli ---
    if (bananas.length === 0 && cucumbers.length === 0) {
        placeBananas();
        placeCucumbers();
    }


    // Collisioni con la fragolina (CAUSA GAME OVER)
    let strawberryRect = { x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE };
    if (checkCollision(playerRect, strawberryRect)) {
        gameOver = true;
    }

    // Collisioni con la patata (CAUSA GAME OVER)
    let potatoRect = { x: potatoX, y: potatoY, width: POTATO_SIZE, height: POTATO_SIZE };
    if (checkCollision(playerRect, potatoRect)) {
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

    // Disegna la patata
    if (potatoImage.complete && potatoImage.naturalWidth > 0) {
        ctx.drawImage(potatoImage, potatoX, potatoY, POTATO_SIZE, POTATO_SIZE);
    } else {
        // Disegna un cerchio marrone come fallback
        ctx.fillStyle = BROWN;
        ctx.beginPath();
        ctx.arc(potatoX + POTATO_SIZE / 2, potatoY + POTATO_SIZE / 2, POTATO_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }


    // Disegna i contatori
    ctx.fillStyle = FONT_COLOR;
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillText(`Banane: ${bananasCollected}`, 10, 30);
    ctx.fillText(`Cetrioli: ${cucumbersCollected}`, 10, 60); // Nuova linea per i cetrioli

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
const totalImages = 5; // player, banana, cucumber, strawberry, potato

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        resetGame(); // Inizializza il gioco
        loop();     // Avvia il game loop
    }
}

playerImage.src = 'assets/faccia.png';
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

potatoImage.src = 'assets/patata.png';
potatoImage.onload = imageLoaded;
potatoImage.onerror = () => {
    console.error("Errore caricamento immagine patata.");
    imageLoaded(); // Conta come caricata anche se con errore
};