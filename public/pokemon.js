// URL for pokemon images
// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png
// https://github.com/PokeAPI/sprites/blob/master/sprites/pokemon/other/dream-world/1.svg

// Selectors for DOM elements
const board = document.querySelector('.board')
const navbar = document.getElementById('navbar');
const startMenuContainer = document.getElementById('startMenuContainer');
const startMenuForm = document.getElementById('startMenuForm');
const startNewGameButton = document.getElementById('newGameButton')
const restartGame = document.getElementById('restart');
const endGameButton = document.getElementById('endGameButton');
const overlay = document.getElementById('overlay');
const guessSpan = document.getElementById('guesses');


// Selector for start menu form label
const labels = document.querySelectorAll('.form-control label');

// Animation for "Enter your name" input in start menu form
labels.forEach(label => {
    label.innerHTML = label.innerText
        .split('')
        .map((letter, idx) => `<span style="transition-delay:${idx * 50}ms">${letter}</span>`)
        .join('')
})

// Prevent submitting of start menu form
startMenuForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
})


// Start new game by clicking start menu button
startNewGameButton.addEventListener('click', () => {
    // Select playername, difficulty level and deck artwork inputs from start menu form
    let playerName = startMenuForm.elements.playerName.value;
    let selectedDifficulty = startMenuForm.elements.difficulty.value;
    let deckArt = startMenuForm.elements.deck.value;
    initGame(playerName, selectedDifficulty, deckArt);
})

// Restart game
restartGame.addEventListener('click', () => {
    resetGame();
})

endGameButton.addEventListener('click', () => {
    overlay.style.display = "none";
    document.getElementById('endMenu').classList.toggle('hide');
    resetGame();
})

// Resets game and state
function resetGame() {
    board.innerHTML = '';
    document.getElementById('guesses').innerText = 0;
    startMenuContainer.classList.toggle('hide');
    navbar.classList.toggle('hide');
    board.classList.toggle('hide');
    startMenuForm.elements.playerName.value = '';
    startMenuForm.elements.difficulty.value = 'easy';
    startMenuForm.elements.deck.value = 'standard';
    resetGameTime();
}

// Object to handle game state. Keep track of order of pokemon array and playing card index on board.
let gameState = {};

// Initialize new game.
async function initGame(username, level, deckArt) {
    resetGameTime();
    startGameTime();
    startMenuContainer.classList.toggle('hide');
    navbar.classList.toggle('hide');
    board.classList.toggle('hide');
    gameState = await startNewGame(username, level, deckArt);
    // console.log('gameState obj:', gameState)
    renderCardsOnBoard(gameState.cards);
    renderCardFaces(gameState.cards, gameState.cardStyle)

    // Enable turning cards around by clicking
    const cards = document.querySelectorAll('.card');
    for (let card of cards) {
        card.addEventListener('click', async () => {
            await turnCard(card.id);
            renderGuesses(gameState.guesses);
            if (gameState.finished) {
                gameFinished()
            }
        });
    }
}


// Variable used to prevent turning cards during setTimeout. Can only turn two cards at one time
let isRunning = false;

// Function to turn cards and check for match
async function turnCard(cardId) {
    if (isRunning || gameState.cards[cardId].open) {
        return;
    }
    isRunning = true;

    gameState.cards[cardId] = await getCard(gameState.id, cardId);
    renderCardFaces(gameState.cards, gameState.cardStyle);

    gameState = await getGameById(gameState.id);
    let delay = !gameState.openCardId ? 1500 : 0;

    setTimeout(() => {
        renderCardFaces(gameState.cards, gameState.cardStyle);
        isRunning = false;
    }, delay)

}

// Function run when game is finished
function gameFinished() {
    stopGameTime();
    overlay.style.display = "block";
    document.getElementById('endMenuName').innerText = `Congratulations, ${gameState.player}!`;
    document.getElementById('guessParagraph').innerText = `Number of guesses: ${gameState.guesses}`;
    document.getElementById('timeParagraph').innerText = `Time it took to finish: ${displayClock.textContent}`;
    document.getElementById('endMenu').classList.toggle('hide');
}

// Update number of guesses
function renderGuesses(numberOfGuesses) {
    guessSpan.innerText = numberOfGuesses;
}

// Draw card elements on board
function renderCardsOnBoard(deckOfCards) {
    for (let i = 0; i < deckOfCards.length; i++) {
        board.innerHTML += `
            <div class="alignmentContainer">
                <div class="cardcontainer">
                    <div class="card" id="${i}">
                        <div class="front">
                            <img src="pokemon_logo.svg">
                        </div>
                        <div class="back">
                        </div>
                    </div>
                </div>
            </div>`
    }
}

// Draw card elements on board
function renderCardFaces(deckOfCards, deckArt) {
    let fileExtension = 'png'
    if (deckArt === 'dream-world') {
        fileExtension = 'svg'
    }

    let i = 0;
    for (let card of deckOfCards) {
        let cardEl = document.getElementById(i);
        if (card.open) {
            cardEl.lastElementChild.innerHTML = `<img src="./sprites/${deckArt}/${card.pokemonId}.${fileExtension}">`
            cardEl.classList.add('turn');
        } else {
            if (cardEl.classList.contains('turn')) {
                cardEl.classList.remove('turn');
                setTimeout(() => {
                    cardEl.lastElementChild.innerHTML = '';
                }, 300)
            }

        }
        i++;
    }
}




// Game Clock adapted from MDN setInterval tutorial
// Define a counter variable for the number of seconds and set it to zero.
let secondCount = 0;
// Define a global to store the interval when it is active.
let gameTime;
// Store a reference to the display div element in a variable
const displayClock = document.querySelector('.clock');

// Function to calculate the current hours, minutes, and seconds, and display the count
function displayCount() {
    // Calculate current hours, minutes, and seconds
    let hours = Math.floor(secondCount / 3600);
    let minutes = Math.floor((secondCount % 3600) / 60);
    let seconds = Math.floor(secondCount % 60)

    // Display a leading zero if the values are less than ten
    let displayHours = (hours < 10) ? '0' + hours : hours;
    let displayMinutes = (minutes < 10) ? '0' + minutes : minutes;
    let displaySeconds = (seconds < 10) ? '0' + seconds : seconds;

    // Write the current stopwatch display time into the display paragraph
    displayClock.textContent = displayHours + ':' + displayMinutes + ':' + displaySeconds;

    // Increment the second counter by one
    secondCount++;
}

function startGameTime() {
    gameTime = setInterval(() => {
        displayCount()
    }, 1000);
}

function stopGameTime() {
    clearInterval(gameTime);
}

function resetGameTime() {
    clearInterval(gameTime);
    secondCount = 0;
    displayCount();
}


