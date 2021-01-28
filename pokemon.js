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
    // Select playername and difficulty inputs from start menu form
    let playerName = startMenuForm.elements.playerName.value;
    let selectedDifficulty = startMenuForm.elements.difficulty.value;
    initGame(selectedDifficulty);
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
const gameState = {
    deckOfCards: null,
    openCardIndex: null,
    guesses: 0,
    cardsOpen: 0
}

// Initialize new game.
function initGame(difficulty) {
    resetGameTime();
    gameState.deckOfCards = null;
    gameState.openCardIndex = null;
    gameState.guesses = 0;
    startGameTime();
    startMenuContainer.classList.toggle('hide');
    navbar.classList.toggle('hide');
    board.classList.toggle('hide');
    const numberOfPokemons = difficultyLevels[difficulty];
    gameState.deckOfCards = newDeck(numberOfPokemons);
    drawCardsOnBoard(gameState.deckOfCards, startMenuForm.elements.deck.value);
    const cards = document.querySelectorAll('.card');

    // Enable turning cards around by clicking
    for (let card of cards) {
        card.addEventListener('click', () => {
            turnCard(card.id);
        });
    }
}


// Variable used to prevent turning cards during setTimeout. Can only turn two cards at one time
let isRunning = false;

// Function to turn cards and check for match
function turnCard(cardID) {
    if (isRunning) {
        return;
    }
    isRunning = true;

    let clickedCard = document.getElementById(cardID);
    console.log('clicedcard:', clickedCard.id)
    console.log('gamestate:', gameState.openCardIndex)

    clickedCard.classList.toggle("turn");

    // Open first card
    if (gameState.openCardIndex === null) {
        gameState.openCardIndex = cardID;
        isRunning = false;
        return;
    }
    // Open second card. Save previous card ID. Compare ID's if match cards remain open. If no match cards are turned back around.
    let previousCard = document.getElementById(gameState.openCardIndex);

    console.log('previouscard:', previousCard.id)


    if (gameState.deckOfCards[cardID] === gameState.deckOfCards[gameState.openCardIndex]) {
        updateGuesses();
        gameState.cardsOpen += 2;
        if (gameState.cardsOpen === gameState.deckOfCards.length) {
            gameFinished();
        }
        gameState.openCardIndex = null;
        isRunning = false;
        return;
    }
    updateGuesses();

    gameState.openCardIndex = null;
    setTimeout(() => {
        clickedCard.classList.toggle("turn");
        previousCard.classList.toggle("turn");
        isRunning = false;
    }, 1500)

}

// Function run when game is finished
function gameFinished() {
    stopGameTime();
    overlay.style.display = "block";
    document.getElementById('endMenuName').innerText = `Congratulations, ${startMenuForm.elements.playerName.value}!`;
    document.getElementById('guessParagraph').innerText = `Number of guesses: ${gameState.guesses}`;
    document.getElementById('timeParagraph').innerText = `Time it took to finish: ${displayClock.textContent}`;
    document.getElementById('endMenu').classList.toggle('hide');
}

// Update number of guesses
function updateGuesses() {
    let guessSpan = document.getElementById('guesses');
    guessSpan.innerText = ++gameState.guesses;
}

// Game difficulties. How many pairs of pokemon.
const difficultyLevels = {
    easy: 10,
    medium: 20,
    hard: 30
}

// Create a deck of pokemon and shuffle pokemon deck
function newDeck(numberOfPokemons) {
    const allPokemons = [];
    for (let i = 1; i < 152; i++) {
        allPokemons.push(i);
    }
    shuffleArray(allPokemons);

    const selectedPokemons = allPokemons.slice(0, numberOfPokemons);
    const cards = [...selectedPokemons, ...selectedPokemons];
    shuffleArray(cards);
    return cards;

}

// Shuffle deck function from StackOverflow
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Array of folder names for different pokemon artwork
// const imageFolder = ['dream-world', 'official-artwork', 'standard'];

// Pick random folder and artwork to use
// function chooseImageFolder(arrayOfFolders) {
//     const rand = Math.floor(Math.random() * 3);
//     return arrayOfFolders[rand];
// }

// Draw card elements on board
function drawCardsOnBoard(deckOfCards, deck) {
    let fileExtension = 'png'
    if (deck === 'dream-world') {
        fileExtension = 'svg'
    }

    let i = 0;
    for (let pokemon of deckOfCards) {
        const cardTemplate =
            `<div class="alignmentContainer">
            <div class="cardcontainer">
        <div class="card" id="${i}">
            <div class="front">front of card
            <img src="pokemon_logo.svg"></div>
            <div class="back">back of card
            <img src="./sprites/${deck}/${pokemon}.${fileExtension}"></div>
        </div>
    </div>
    </div>`
        board.innerHTML += cardTemplate;
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


