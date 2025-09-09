const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

// Giocatore
let playerImage = new Image();
let playerLoseImage = new Image();
const PLAYER_NORMAL_IMAGE_SRC = 'assets/faccia.png';
const PLAYER_LOSE_IMAGE_SRC = 'assets/faccia_lose.png';

const PLAYER_SIZE = 50;
let playerX = (SCREEN_WIDTH - PLAYER_SIZE) / 2;
let playerY = (SCREEN_HEIGHT - PLAYER_SIZE) / 2;
const playerSpeed = 5;

// Banane
let bananaImage = new Image();
const BANANA_SIZE = 40;
let bananas = [];
const NUM_BANANAS = 5;
const YELLOW = 'rgb(255, 255, 0)';

// Cetrioli
let cucumberImage = new Image();
const CUCUMBER_SIZE = 40;
let cucumbers = [];
const NUM_CUCUMBERS = 5;
const GREEN = 'rgb(0, 128, 0)';

// Fragolina
let strawberryImage = new Image();
const STRAWBERRY_SIZE = 30;
let strawberries = [];
const INITIAL_NUM_STRAWBERRIES = 1;
let currentNumStrawberries = INITIAL_NUM_STRAWBERRIES;
const STRAWBERRY_BASE_SPEED = 3;
const RED = 'rgb(255, 0, 0)';

// Patata
let potatoImage = new Image();
const POTATO_SIZE = 45;
let potatoes = [];
const INITIAL_NUM_POTATOES = 1;
let currentNumPotatoes = INITIAL_NUM_POTATOES;
const POTATO_SPEED = 2;
const BROWN = 'rgb(139, 69, 19)';

// Oggetto Nero (Bonus)
let neroImage = new Image();
const NERO_SIZE = 60;
let nero = null;
const NERO_SPAWN_CHANCE = 0.3;

// Oggetto Vibro (Immunità)
let vibroImage = new Image();
const VIBRO_SIZE = 55;
let vibro = null;
const VIBRO_SPAWN_CHANCE = 0.2;
const VIBRO_IMMUNITY_DURATION = 30; // Durata immunità in secondi
let isImmune = false;
let immunityStartTime = 0;
const BLUE = 'rgb(0, 0, 255)';

// Punteggio e conteggi
let bananasCollected = 0;
let cucumbersCollected = 0;
let lastBananaThreshold = 0; // Per tenere traccia dell'ultima soglia di difficoltà per le banane
let lastCucumberThreshold = 0; // Per tenere traccia dell'ultima soglia di difficoltà per i cetrioli

const FONT_SIZE = 24;
const FONT_COLOR = 'red';
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
    'bg/super_mario.png',
    'bg/pacman.png',
    'bg/donkey_kong.png',
    'bg/metal_slug.png',
    'bg/street_fighter.png',
    'bg/mortal_kombat.png',
    'bg/doom.png',
    'bg/bubble_bobble.png',
    'bg/arkanoid.png',
    'bg/shinobi.png',
    'bg/ghosts_goblins.png'
];
let currentBackgroundIndex = 0;
let backgroundImage = new Image();

// --- Musica e Suoni ---
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggleButton = document.getElementById('musicToggleButton');
const loseSound = document.getElementById('loseSound');
let isMusicPlaying = false;

function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicToggleButton.textContent = 'Musica: OFF';
    } else {
        backgroundMusic.play().catch(e => {
            console.warn("La riproduzione automatica della musica è stata bloccata dal browser:", e);
        });
        musicToggleButton.textContent = 'Musica: ON';
    }
    isMusicPlaying = !isMusicPlaying;
}

musicToggleButton.addEventListener('click', toggleMusic);


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

// Funzione per creare un singolo oggetto fragolina o patata
function createHazardObject(type) {
    let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                            .concat(bananas)
                            .concat(cucumbers)
                            .concat(strawberries.map(s => ({x: s.x, y: s.y, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE})))
                            .concat(potatoes.map(p => ({x: p.x, y: p.y, width: POTATO_SIZE, height: POTATO_SIZE})));

    if (nero) excludeRects.push(nero);
    if (vibro) excludeRects.push(vibro);

    if (type === 'strawberry') {
        let newStrawberryRect = findNonOverlappingPosition(STRAWBERRY_SIZE, excludeRects);
        if (newStrawberryRect) {
            let speedX = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
            let speedY = (Math.random() < 0.5 ? 1 : -1) * STRAWBERRY_BASE_SPEED;
            return { x: newStrawberryRect.x, y: newStrawberryRect.y, speedX: speedX, speedY: speedY };
        }
    } else if (type === 'potato') {
        let newPotatoRect = findNonOverlappingPosition(POTATO_SIZE, excludeRects, true);
        if (newPotatoRect) {
            return { x: newPotatoRect.x, y: newPotatoRect.y };
        }
    }
    return null;
}

/**
 * Controlla se il numero di banane/cetrioli raccolti ha superato una soglia di 20
 * e aggiunge una nuova patata/fragolina di conseguenza.
 * Gestisce anche i salti di più soglie (ad esempio con l'oggetto nero).
 */
function checkAndIncreaseDifficulty() {
    // Aumento patate per banane
    while (bananasCollected >= lastBananaThreshold + 20) {
        currentNumPotatoes++;
        const newPotato = createHazardObject('potato');
        if (newPotato) potatoes.push(newPotato);
        lastBananaThreshold += 20;
    }

    // Aumento fragoline per cetrioli
    while (cucumbersCollected >= lastCucumberThreshold + 20) {
        currentNumStrawberries++;
        const newStrawberry = createHazardObject('strawberry');
        if (newStrawberry) strawberries.push(newStrawberry);
        lastCucumberThreshold += 20;
    }
}


// --- Funzioni di gioco ---

function placeBananas() {
    bananas = [];
    while (bananas.length < NUM_BANANAS) {
        let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                                .concat(cucumbers)
                                .concat(strawberries.map(s => ({x: s.x, y: s.y, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE})))
                                .concat(potatoes.map(p => ({x: p.x, y: p.y, width: POTATO_SIZE, height: POTATO_SIZE})));
        if (nero) excludeRects.push(nero);
        if (vibro) excludeRects.push(vibro);
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
                                .concat(strawberries.map(s => ({x: s.x, y: s.y, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE})))
                                .concat(potatoes.map(p => ({x: p.x, y: p.y, width: POTATO_SIZE, height: POTATO_SIZE})));
        if (nero) excludeRects.push(nero);
        if (vibro) excludeRects.push(vibro);
        let newCucumberRect = findNonOverlappingPosition(CUCUMBER_SIZE, excludeRects);
        if (newCucumberRect) {
            cucumbers.push(newCucumberRect);
        }
    }
}

function placeNero() {
    let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                            .concat(bananas)
                            .concat(cucumbers)
                            .concat(strawberries.map(s => ({x: s.x, y: s.y, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE})))
                            .concat(potatoes.map(p => ({x: p.x, y: p.y, width: POTATO_SIZE, height: POTATO_SIZE})));
    if (vibro) excludeRects.push(vibro);
    let newNeroRect = findNonOverlappingPosition(NERO_SIZE, excludeRects);
    if (newNeroRect) {
        nero = newNeroRect;
    }
}

function placeVibro() {
    let excludeRects = [{ x: playerX, y: playerY, width: PLAYER_SIZE, height: PLAYER_SIZE }]
                            .concat(bananas)
                            .concat(cucumbers)
                            .concat(strawberries.map(s => ({x: s.x, y: s.y, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE})))
                            .concat(potatoes.map(p => ({x: p.x, y: p.y, width: POTATO_SIZE, height: POTATO_SIZE})));
    if (nero) excludeRects.push(nero);
    let newVibroRect = findNonOverlappingPosition(VIBRO_SIZE, excludeRects);
    if (newVibroRect) {
        vibro = newVibroRect;
    }
}


function spawnInitialHazards() {
    strawberries = [];
    potatoes = [];
    for (let i = 0; i < currentNumStrawberries; i++) {
        const newStrawberry = createHazardObject('strawberry');
        if (newStrawberry) strawberries.push(newStrawberry);
    }
    for (let i = 0; i < currentNumPotatoes; i++) {
        const newPotato = createHazardObject('potato');
        if (newPotato) potatoes.push(newPotato);
    }
}

function loadRandomBackground() {
    currentBackgroundIndex = Math.floor(Math.random() * BACKGROUND_IMAGE_URLS.length);
    backgroundImage.src = BACKGROUND_IMAGE_URLS[currentBackgroundIndex];
}

function loadNextBackground() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % BACKGROUND_IMAGE_URLS.length;
    backgroundImage.src = BACKGROUND_IMAGE_URLS[currentBackgroundIndex];
}

function resetGame() {
    gameOver = false;
    bananasCollected = 0;
    cucumbersCollected = 0;
    lastBananaThreshold = 0;
    lastCucumberThreshold = 0;
    nero = null;
    vibro = null;
    isImmune = false;
    immunityStartTime = 0;

    playerX = (SCREEN_WIDTH - PLAYER_SIZE) / 2;
    playerY = (SCREEN_HEIGHT - PLAYER_SIZE) / 2;
    
    playerImage.src = PLAYER_NORMAL_IMAGE_SRC; 
    
    currentNumPotatoes = INITIAL_NUM_POTATOES;
    currentNumStrawberries = INITIAL_NUM_STRAWBERRIES;

    placeBananas();
    placeCucumbers();
    spawnInitialHazards();
    
    loadRandomBackground();
}

function updateGame() {
    if (gameOver) return;

    if (isImmune) {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - immunityStartTime) / 1000;
        if (elapsedTime >= VIBRO_IMMUNITY_DURATION) {
            isImmune = false;
            immunityStartTime = 0;
        }
    }

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

    strawberries.forEach(strawberry => {
        strawberry.x += strawberry.speedX;
        strawberry.y += strawberry.speedY;

        if (strawberry.x + STRAWBERRY_SIZE > SCREEN_WIDTH || strawberry.x < 0) {
            strawberry.speedX *= -1;
        }
        if (strawberry.y + STRAWBERRY_SIZE > SCREEN_HEIGHT || strawberry.y < 0) {
            strawberry.speedY *= -1;
        }
    });

    potatoes.forEach(potato => {
        potato.y += POTATO_SPEED;
        if (potato.y > SCREEN_HEIGHT) {
            const newPotatoPos = createHazardObject('potato');
            if (newPotatoPos) {
                potato.x = newPotatoPos.x;
                potato.y = newPotatoPos.y;
            } else {
                potato.x = Math.random() * (SCREEN_WIDTH - POTATO_SIZE);
                potato.y = -POTATO_SIZE;
            }
        }
    });


    // Collisioni con le banane
    let bananasToRemove = [];
    bananas.forEach((banana, index) => {
        if (checkCollision(playerRect, banana)) {
            bananasToRemove.push(index);
            bananasCollected += 1;
            checkAndIncreaseDifficulty(); // Controlla e aumenta difficoltà
        }
    });

    for (let i = bananasToRemove.length - 1; i >= 0; i--) {
        bananas.splice(bananasToRemove[i], 1);
    }

    // Collisioni con i cetrioli
    let cucumbersToRemove = [];
    cucumbers.forEach((cucumber, index) => {
        if (checkCollision(playerRect, cucumber)) {
            cucumbersToRemove.push(index);
            cucumbersCollected += 1;
            checkAndIncreaseDifficulty(); // Controlla e aumenta difficoltà
        }
    });

    for (let i = cucumbersToRemove.length - 1; i >= 0; i--) {
        cucumbers.splice(cucumbersToRemove[i], 1);
    }

    if (bananas.length === 0 && cucumbers.length === 0) {
        placeBananas();
        placeCucumbers();
        loadNextBackground();
        if (Math.random() < NERO_SPAWN_CHANCE) {
            placeNero();
        } else {
            nero = null;
        }
        if (Math.random() < VIBRO_SPAWN_CHANCE) {
            placeVibro();
        } else {
            vibro = null;
        }
    }

    // Collisione con l'oggetto nero
    if (nero) {
        let neroRect = { x: nero.x, y: nero.y, width: NERO_SIZE, height: NERO_SIZE };
        if (checkCollision(playerRect, neroRect)) {
            bananasCollected += bananas.length;
            bananas = []; // Svuota le banane
            cucumbersCollected += cucumbers.length;
            cucumbers = []; // Svuota i cetrioli
            nero = null;

            checkAndIncreaseDifficulty(); // Controlla e aumenta difficoltà dopo aver preso nero
        }
    }

    // Collisione con l'oggetto Vibro
    if (vibro) {
        let vibroRect = { x: vibro.x, y: vibro.y, width: VIBRO_SIZE, height: VIBRO_SIZE };
        if (checkCollision(playerRect, vibroRect)) {
            isImmune = true;
            immunityStartTime = Date.now();
            vibro = null;
        }
    }

    // Collisioni con le fragoline (CAUSA GAME OVER se non immune)
    if (!isImmune) {
        strawberries.forEach(strawberry => {
            let strawberryRect = { x: strawberry.x, y: strawberry.y, width: STRAWBERRY_SIZE, height: STRAWBERRY_SIZE };
            if (checkCollision(playerRect, strawberryRect)) {
                gameOver = true;
                playerImage.src = PLAYER_LOSE_IMAGE_SRC;
                backgroundMusic.pause();
                loseSound.play();
            }
        });

        // Collisioni con le patate (CAUSA GAME OVER se non immune)
        potatoes.forEach(potato => {
            let potatoRect = { x: potato.x, y: potato.y, width: POTATO_SIZE, height: POTATO_SIZE };
            if (checkCollision(playerRect, potatoRect)) {
                gameOver = true;
                playerImage.src = PLAYER_LOSE_IMAGE_SRC;
                backgroundMusic.pause();
                loseSound.play();
            }
        });
    }
}

function drawGame() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
        ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

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

    strawberries.forEach(strawberry => {
        if (strawberryImage.complete && strawberryImage.naturalWidth > 0) {
            ctx.drawImage(strawberryImage, strawberry.x, strawberry.y, STRAWBERRY_SIZE, STRAWBERRY_SIZE);
        } else {
            ctx.fillStyle = RED;
            ctx.beginPath();
            ctx.arc(strawberry.x + STRAWBERRY_SIZE / 2, strawberry.y + STRAWBERRY_SIZE / 2, STRAWBERRY_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    potatoes.forEach(potato => {
        if (potatoImage.complete && potatoImage.naturalWidth > 0) {
            ctx.drawImage(potatoImage, potato.x, potato.y, POTATO_SIZE, POTATO_SIZE);
        } else {
            ctx.fillStyle = BROWN;
            ctx.beginPath();
            ctx.arc(potato.x + POTATO_SIZE / 2, potato.y + POTATO_SIZE / 2, POTATO_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    if (nero) {
        if (neroImage.complete && neroImage.naturalWidth > 0) {
            ctx.drawImage(neroImage, nero.x, nero.y, NERO_SIZE, NERO_SIZE);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(nero.x, nero.y, NERO_SIZE, NERO_SIZE);
        }
    }

    if (vibro) {
        if (vibroImage.complete && vibroImage.naturalWidth > 0) {
            ctx.drawImage(vibroImage, vibro.x, vibro.y, VIBRO_SIZE, VIBRO_SIZE);
        } else {
            ctx.fillStyle = BLUE;
            ctx.fillRect(vibro.x, vibro.y, VIBRO_SIZE, VIBRO_SIZE);
        }
    }

    ctx.fillStyle = FONT_COLOR;
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillText(`Banane: ${bananasCollected}`, 10, 30);
    ctx.fillText(`Cetrioli: ${cucumbersCollected}`, 10, 60);

    if (isImmune) {
        const remainingTime = Math.ceil(VIBRO_IMMUNITY_DURATION - (Date.now() - immunityStartTime) / 1000);
        ctx.fillStyle = 'blue';
        ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
        ctx.fillText(`Immunità: ${remainingTime}s`, SCREEN_WIDTH - 150, 30);
    }

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
        if (isMusicPlaying) {
            backgroundMusic.play().catch(e => console.warn("Errore nel riavvio della musica:", e));
        }
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
const totalImages = 9; // player, playerLose, banana, cucumber, strawberry, potato, nero, vibro, FIRST background

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        resetGame();
        loop();
    }
}

playerImage.src = PLAYER_NORMAL_IMAGE_SRC;
playerImage.onload = imageLoaded;
playerImage.onerror = () => {
    console.error("Errore caricamento immagine giocatore normale.");
    imageLoaded();
};

playerLoseImage.src = PLAYER_LOSE_IMAGE_SRC;
playerLoseImage.onload = imageLoaded;
playerLoseImage.onerror = () => {
    console.error("Errore caricamento immagine giocatore 'lose'.");
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

neroImage.src = 'assets/nero.png';
neroImage.onload = imageLoaded;
neroImage.onerror = () => {
    console.error("Errore caricamento immagine 'nero'.");
    imageLoaded();
};

vibroImage.src = 'assets/vibro.png';
vibroImage.onload = imageLoaded;
vibroImage.onerror = () => {
    console.error("Errore caricamento immagine 'vibro'.");
    imageLoaded();
};

loadRandomBackground();
backgroundImage.onload = imageLoaded;
backgroundImage.onerror = () => {
    console.error("Errore caricamento immagine sfondo iniziale.");
    imageLoaded();
};