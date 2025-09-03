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
let bananasCollected = 0;
let cucumbersCollected = 0;
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

// --- Sfondi dinamici ---
const BACKGROUND_IMAGE_URLS = [
    'https://images.pexels.com/photos/3304199/pexels-photo-3304199.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Foresta 1
    'https://images.pexels.com/photos/1036399/pexels-photo-1036399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Spiaggia 1
    'https://images.pexels.com/photos/2086208/pexels-photo-2086208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Deserto 1
    'https://images.pexels.com/photos/1563256/pexels-photo-1563256.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Lago di montagna 1
    'https://images.pexels.com/photos/236111/pexels-photo-236111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',  // Parco cittadino 1
    'https://images.pexels.com/photos/17228203/pexels-photo-17228203/free-photo-of-buildings-in-the-city-at-night.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Città notturna
    'https://images.pexels.com/photos/2150/sky-space-deep-space-galaxy.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Spazio
    'https://images.pexels.com/photos/1749/abstract-light-dark-blue.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Astratto blu
    'https://images.pexels.com/photos/36717/amazing-beautiful-beauty-blue.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Montagne azzurre
    'https://images.pexels.com/photos/1206412/pexels-photo-1206412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Strada in foresta
    'https://images.pexels.com/photos/235615/pexels-photo-235615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Fiume nella natura
    'https://images.pexels.com/photos/355904/pexels-photo-355904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Campo di fiori
    'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Via lattea
    'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Onde del mare
    'https://images.pexels.com/photos/108941/pexels-photo-108941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Montagne innevate
    'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Alberi d'autunno
    'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Cascata
    'https://images.pexels.com/photos/1004620/pexels-photo-1004620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Fari
    'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Paesaggio verde
    'https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Aurora boreale
    'https://images.pexels.com/photos/417054/pexels-photo-417054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Deserto al tramonto
    'https://images.pexels.com/photos/1107717/pexels-photo-1107717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Strada di montagna
    'https://images.pexels.com/photos/358457/pexels-photo-358457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Mare calmo
    'https://images.pexels.com/photos/1486972/pexels-photo-1486972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Giungla
    'https://images.pexels.com/photos/5439/nature-forest-trees-path.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'  // Sentiero nel bosco
];
let currentBackgroundIndex = 0;
let backgroundImage = new Image();


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
        if (isFalling) {
            newRect = {
                x: Math.random() * (SCREEN_WIDTH - size),
                y: -size,
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
    } else {
        strawberryX = (SCREEN_WIDTH - STRAWBERRY_SIZE) / 2;
        strawberryY = (SCREEN_HEIGHT - STRAWBERRY_SIZE) / 2;
    }

    strawberrySpeedX = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
    strawberrySpeedY = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
}

function placePotato() {
    let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                            .concat(bananas)
                            .concat(cucumbers)
                            .concat([{ x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE }]);
    let newPotatoRect = findNonOverlappingPosition(POTATO_SIZE, excludeRects, true);
    if (newPotatoRect) {
        potatoX = newPotatoRect.x;
        potatoY = newPotatoRect.y;
    } else {
        potatoX = Math.random() * (SCREEN_WIDTH - POTATO_SIZE);
        potatoY = -POTATO_SIZE;
    }
}

function loadNextBackground() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % BACKGROUND_IMAGE_URLS.length;
    backgroundImage.src = BACKGROUND_IMAGE_URLS[currentBackgroundIndex];
}

function resetGame() {
    gameOver = false;
    bananasCollected = 0;
    cucumbersCollected = 0;
    playerX = (SCREEN_WIDTH - PLAYER_SIZE) / 2;
    playerY = (SCREEN_HEIGHT - PLAYER_SIZE) / 2;
    
    placePotato();
    placeStrawberry();
    placeBananas();
    placeCucumbers();
    
    // Inizializza o cambia lo sfondo
    currentBackgroundIndex = -1; // Per assicurare che loadNextBackground carichi il primo (index 0)
    loadNextBackground();
}

function updateGame() {
    if (gameOver) return;

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

    playerX = Math.max(0, Math.min(playerX, SCREEN_WIDTH - PLAYER_SIZE));
    playerY = Math.max(0, Math.min(playerY, SCREEN_HEIGHT - PLAYER_SIZE));

    let playerRect = { x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE };

    strawberryX += strawberrySpeedX;
    strawberryY += strawberrySpeedY;

    if (strawberryX + STRAWBERRY_SIZE > SCREEN_WIDTH || strawberryX < 0) {
        strawberrySpeedX *= -1;
    }
    if (strawberryY + STRAWBERRY_SIZE > SCREEN_HEIGHT || strawberryY < 0) {
        strawberrySpeedY *= -1;
    }

    potatoY += POTATO_SPEED;
    if (potatoY > SCREEN_HEIGHT) {
        placePotato();
    }

    let bananasToRemove = [];
    bananas.forEach((banana, index) => {
        if (checkCollision(playerRect, banana)) {
            bananasToRemove.push(index);
            bananasCollected += 1;
        }
    });

    for (let i = bananasToRemove.length - 1; i >= 0; i--) {
        bananas.splice(bananasToRemove[i], 1);
    }

    let cucumbersToRemove = [];
    cucumbers.forEach((cucumber, index) => {
        if (checkCollision(playerRect, cucumber)) {
            cucumbersToRemove.push(index);
            cucumbersCollected += 1;
        }
    });

    for (let i = cucumbersToRemove.length - 1; i >= 0; i--) {
        cucumbers.splice(cucumbersToRemove[i], 1);
    }

    // Rigenerazione combinata di banane e cetrioli
    if (bananas.length === 0 && cucumbers.length === 0) {
        placeBananas();
        placeCucumbers();
        loadNextBackground(); // Cambia lo sfondo qui
    }

    let strawberryRect = { x: strawberryX, y: strawberryY, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE };
    if (checkCollision(playerRect, strawberryRect)) {
        gameOver = true;
    }

    let potatoRect = { x: potatoX, y: potatoY, width: POTATO_SIZE, height: POTATO_SIZE };
    if (checkCollision(playerRect, potatoRect)) {
        gameOver = true;
    }
}

function drawGame() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Disegna lo sfondo per primo
    if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
        ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    ctx.drawImage(playerImage, playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);

    bananas.forEach(banana => {
        if (bananaImage.complete && bananaImage.naturalWidth > 0) {
            ctx.drawImage(bananaImage, banana.x, banana.y, banana.width, banana.height);
        } else {
            ctx.fillStyle = YELLOW;
            ctx.beginPath();
            ctx.arc(banana.x + banana.width / 2, banana.y + banana.height / 2, banana.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    cucumbers.forEach(cucumber => {
        if (cucumberImage.complete && cucumberImage.naturalWidth > 0) {
            ctx.drawImage(cucumberImage, cucumber.x, cucumber.y, cucumber.width, cucumber.height);
        } else {
            ctx.fillStyle = GREEN;
            ctx.beginPath();
            ctx.arc(cucumber.x + cucumber.width / 2, cucumber.y + cucumber.height / 2, cucumber.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    if (strawberryImage.complete && strawberryImage.naturalWidth > 0) {
        ctx.drawImage(strawberryImage, strawberryX, strawberryY, STRAWBERRY_SIZE, STRAWBERRY_SIZE);
    } else {
        ctx.fillStyle = RED;
        ctx.beginPath();
        ctx.arc(strawberryX + STRAWBERRY_SIZE / 2, strawberryY + STRAWBERRY_SIZE / 2, STRAWBERRY_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    if (potatoImage.complete && potatoImage.naturalWidth > 0) {
        ctx.drawImage(potatoImage, potatoX, potatoY, POTATO_SIZE, POTATO_SIZE);
    } else {
        ctx.fillStyle = BROWN;
        ctx.beginPath();
        ctx.arc(potatoX + POTATO_SIZE / 2, potatoY + POTATO_SIZE / 2, POTATO_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = FONT_COLOR;
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillText(`Banane: ${bananasCollected}`, 10, 30);
    ctx.fillText(`Cetrioli: ${cucumbersCollected}`, 10, 60);

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = `48px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER!", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 24);
        ctx.font = `24px ${FONT_FAMILY}`;
        ctx.fillText("Premi 'R' per riavviare", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 24);
        ctx.textAlign = 'left';
    }
}

function loop() {
    updateGame();
    drawGame();
    if (!gameOver) {
        requestAnimationFrame(loop);
    }
}

window.addEventListener('keydown', (e) => {
    if (gameOver && e.key === 'r') {
        resetGame();
        loop();
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
let imagesLoaded = 0;
const totalImages = 6; 

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        resetGame();
        loop();
    }
}

playerImage.src = 'assets/faccia.png';
playerImage.onload = imageLoaded;
playerImage.onerror = () => {
    console.error("Errore caricamento immagine giocatore.");
    imageLoaded();
};

bananaImage.src = 'assets/banana.png';
bananaImage.onload = imageLoaded;
bananaImage.onerror = () => {
    console.error("Errore caricamento immagine banana.");
    imageLoaded();
};

cucumberImage.src = 'assets/cetriolo.png';
cucumberImage.onload = imageLoaded;
cucumberImage.onerror = () => {
    console.error("Errore caricamento immagine cetriolo.");
    imageLoaded();
};

strawberryImage.src = 'assets/fragolina.png';
strawberryImage.onload = imageLoaded;
strawberryImage.onerror = () => {
    console.error("Errore caricamento immagine fragolina.");
    imageLoaded();
};

potatoImage.src = 'assets/patata.png';
potatoImage.onload = imageLoaded;
potatoImage.onerror = () => {
    console.error("Errore caricamento immagine patata.");
    imageLoaded();
};

backgroundImage.src = BACKGROUND_IMAGE_URLS[0];
backgroundImage.onload = imageLoaded;
backgroundImage.onerror = () => {
    console.error("Errore caricamento immagine sfondo iniziale.");
    imageLoaded();
};