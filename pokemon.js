// URL for pokemon images
// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png

// Selectors for DOM elements
const board = document.querySelector('.board')
const navbar = document.getElementById('navbar');
const startMenuContainer = document.getElementById('startMenuContainer');
const startMenuForm = document.getElementById('startMenuForm');
const startNewGameButton = document.getElementById('newGameButton')
const restartGame = document.getElementById('restart');

const labels = document.querySelectorAll('.form-control label');

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



// Start new game by clicking button
startNewGameButton.addEventListener('click', () => {
    // Select playername and difficulty data from form
    let playerName = startMenuForm.elements.playerName.value;
    let selectedDifficulty = startMenuForm.elements.difficulty.value;
    initGame(selectedDifficulty);
})

// Restart game
restartGame.addEventListener('click', () => {
    board.innerHTML = '';
    document.getElementById('guesses').innerText = 0;
    startMenuContainer.classList.toggle('hide');
    navbar.classList.toggle('hide');
    board.classList.toggle('hide');
    startMenuForm.elements.playerName.value = '';
})

const gameState = {
    deckOfCards: null,
    openCardIndex: null,
    guesses: 1
}

function initGame(difficulty) {
    gameState.deckOfCards = null;
    gameState.openCardIndex = null;
    gameState.guesses = 1;
    startMenuContainer.classList.toggle('hide');
    navbar.classList.toggle('hide');
    board.classList.toggle('hide');
    const numberOfPokemons = difficultyLevels[difficulty];
    gameState.deckOfCards = newDeck(numberOfPokemons);
    drawCardsOnBoard(gameState.deckOfCards);
    const cards = document.querySelectorAll('.card');

    // Enable turning cards around by clicking
    for (let card of cards) {
        card.addEventListener('click', () => {
            turnCard(card.id);
        });
    }
}

let isRunning = false;

function turnCard(cardID) {
    if (isRunning) {
        return;
    }
    isRunning = true;

    let clickedCard = document.getElementById(cardID);
    clickedCard.classList.toggle("turn");

    // Open first card
    if (gameState.openCardIndex === null) {
        updateGuesses();
        gameState.openCardIndex = cardID;
        console.log("First card turn")
        console.log("clickedCard: ", clickedCard)
        console.log("gameState.openCardIndex: ", gameState.openCardIndex)
        isRunning = false;
        return;
    }
    // Open second card. Save previous card ID. Compare ID's if match cards remain open. If no match cards are turned back around.
    let previousCard = document.getElementById(gameState.openCardIndex);

    if (gameState.deckOfCards[cardID] === gameState.deckOfCards[gameState.openCardIndex]) {
        updateGuesses();

        gameState.openCardIndex = null;
        console.log("Second card turn: match")
        console.log("clickedCard: ", clickedCard)
        console.log("previousCard: ", previousCard)
        console.log("gameState.openCardIndex: ", gameState.openCardIndex)
        isRunning = false;
        return;
    }
    console.log("Second Card Turn: No match")
    console.log("previousCard: ", previousCard)
    console.log("clickedCard: ", clickedCard)
    console.log("gameState.openCardIndex: ", gameState.openCardIndex)
    updateGuesses();

    gameState.openCardIndex = null;
    setTimeout(() => {
        clickedCard.classList.toggle("turn");
        previousCard.classList.toggle("turn");
        isRunning = false;

        console.log("previousCard: ", previousCard)
        console.log("clickedCard: ", clickedCard)
        console.log("gameState.openCardIndex: ", gameState.openCardIndex)
    }, 1500)

}

function updateGuesses() {
    let guessSpan = document.getElementById('guesses');
    guessSpan.innerText = gameState.guesses++;
}

// Game difficulties. How many pairs of pokemon.
const difficultyLevels = {
    easy: 10,
    medium: 20,
    hard: 30
}

// Create a deck
function newDeck(numberOfPokemons) {
    const allPokemons = [];
    for (let i = 1; i < 153; i++) {
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

// Draw cards on board
function drawCardsOnBoard(deckOfCards) {
    let i = 0;
    for (let pokemon of deckOfCards) {
        const cardTemplate =
            `<div class="alignmentContainer">
            <div class="cardcontainer">
        <div class="card" id="${i}">
            <div class="front">front of card
            <img src="pokemon_logo.svg"></div>
            <div class="back">back of card
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon}.png"></div>
        </div>
    </div>
    </div>`
        board.innerHTML += cardTemplate;
        i++;
    }
}




