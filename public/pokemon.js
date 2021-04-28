// URL for pokemon images
// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png
// https://github.com/PokeAPI/sprites/blob/master/sprites/pokemon/other/dream-world/1.svg

// Object to handle game state. Keep track of order of pokemon array and playing card index on board.
let gameState = {};

// Load existing game session from cookie if there is one
async function loadExistingGame() {
  try {
    if (document.cookie) {
      const gameId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('gameId='))
        .split('=')[1];

      gameState = await getGameById(gameId);
      initGame(gameState);
    }
  } catch {
    return;
  }
}

loadExistingGame();

// Selectors for DOM elements
const board = document.querySelector('.board');
const navbar = document.getElementById('navbar');
const startMenuContainer = document.getElementById('startMenuContainer');
const startMenuForm = document.getElementById('startMenuForm');
const startNewGameButton = document.getElementById('newGameButton');
const restartGame = document.getElementById('restart');
const endGameButton = document.getElementById('endGameButton');
const overlay = document.getElementById('overlay');
const guessSpan = document.getElementById('guesses');

// Selector for start menu form label
const labels = document.querySelectorAll('.form-control label');

// Animation for "Enter your name" input in start menu form
labels.forEach((label) => {
  label.innerHTML = label.innerText
    .split('')
    .map(
      (letter, idx) =>
        `<span style="transition-delay:${idx * 50}ms">${letter}</span>`
    )
    .join('');
});

// Prevent submitting of start menu form
startMenuForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
});

// Start new game by clicking start menu button
startNewGameButton.addEventListener('click', async () => {
  // Select playername, difficulty level and deck artwork inputs from start menu form
  let username = startMenuForm.elements.playerName.value;
  let level = startMenuForm.elements.difficulty.value;
  let deckArt = startMenuForm.elements.deck.value;
  gameState = await startNewGame(username, level, deckArt);
  initGame(gameState);
});

// Restart game
restartGame.addEventListener('click', () => {
  resetGame();
});

endGameButton.addEventListener('click', () => {
  overlay.style.display = 'none';
  document.getElementById('endMenu').classList.toggle('hide');
  resetGame();
});

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
}

// Initialize new game.
function initGame(gameState) {
  startGameTime(gameState.startedAt);
  renderGuesses(gameState.guesses);
  startMenuContainer.classList.toggle('hide');
  navbar.classList.toggle('hide');
  board.classList.toggle('hide');
  // console.log('gameState obj:', gameState)
  renderCardsOnBoard(gameState.cards);
  renderCardFaces(gameState.cards, gameState.cardStyle);

  // Enable turning cards around by clicking
  const cards = document.querySelectorAll('.card');
  for (let card of cards) {
    card.addEventListener('click', () => {
      turnCard(card.id);
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

  renderGuesses(gameState.guesses);
  if (gameState.finished) {
    gameFinished();
  }

  let delay = !gameState.openCardId ? 1500 : 0;

  setTimeout(() => {
    renderCardFaces(gameState.cards, gameState.cardStyle);
    isRunning = false;
  }, delay);
}

// Function run when game is finished
function gameFinished() {
  stopGameTime();
  overlay.style.display = 'block';
  document.getElementById(
    'endMenuName'
  ).innerText = `Congratulations, ${gameState.player}!`;
  document.getElementById(
    'guessParagraph'
  ).innerText = `Number of guesses: ${gameState.guesses}`;
  document.getElementById(
    'timeParagraph'
  ).innerText = `Time it took to finish: ${displayClock.textContent}`;
  renderHighScores();
  document.getElementById('endMenu').classList.toggle('hide');
}

// Render high scores list in end menu
async function renderHighScores() {
  const highScoresList = document.getElementById('highScoresList');
  const highscores = await getHighScores();

  // Highscores returned in JSON
  // Map over scores and create list elements. gameTime in ms calculate it to show min and sec.
  // Join array elements together with '' to replace default comma
  highScoresList.innerHTML = highscores
    .map((score) => {
      elapsedSeconds = Math.round(score.gametime / 1000);
      elapsedGameTime = renderHighScoresTime(elapsedSeconds);

      return `<li class="high-score">${score.player} - ${score.guesses} guesses in ${elapsedGameTime}</li>`;
    })
    .join('');
}

// Function modified from renderTimer just to return string of elapsed gametime
function renderHighScoresTime(secondCount) {
  // Calculate current hours, minutes, and seconds
  let hours = Math.floor(secondCount / 3600);
  let minutes = Math.floor((secondCount % 3600) / 60);
  let seconds = Math.floor(secondCount % 60);

  // Display a leading zero if the values are less than ten
  let displayHours = hours < 10 ? '0' + hours : hours;
  let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
  let displaySeconds = seconds < 10 ? '0' + seconds : seconds;

  // Write the current stopwatch display time into the display paragraph
  const elapsedTime =
    displayHours + ':' + displayMinutes + ':' + displaySeconds;

  return elapsedTime;
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
            </div>`;
  }
}

// Draw card elements on board
function renderCardFaces(deckOfCards, deckArt) {
  let fileExtension = 'png';
  if (deckArt === 'dream-world') {
    fileExtension = 'svg';
  }

  let i = 0;
  for (let card of deckOfCards) {
    let cardEl = document.getElementById(i);
    if (card.open) {
      cardEl.lastElementChild.innerHTML = `<img src="./sprites/${deckArt}/${card.pokemonId}.${fileExtension}">`;
      cardEl.classList.add('turn');
    } else {
      if (cardEl.classList.contains('turn')) {
        cardEl.classList.remove('turn');
        setTimeout(() => {
          cardEl.lastElementChild.innerHTML = '';
        }, 300);
      }
    }
    i++;
  }
}

// Game Clock adapted from MDN setInterval tutorial

// Define a global to store the interval when it is active.
let gameTime;
// Store a reference to the display div element in a variable
const displayClock = document.querySelector('.clock');

// Function to calculate the current hours, minutes, and seconds, and display the count
function renderTimer(secondCount) {
  // Calculate current hours, minutes, and seconds
  let hours = Math.floor(secondCount / 3600);
  let minutes = Math.floor((secondCount % 3600) / 60);
  let seconds = Math.floor(secondCount % 60);

  // Display a leading zero if the values are less than ten
  let displayHours = hours < 10 ? '0' + hours : hours;
  let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
  let displaySeconds = seconds < 10 ? '0' + seconds : seconds;

  // Write the current stopwatch display time into the display paragraph
  displayClock.textContent =
    displayHours + ':' + displayMinutes + ':' + displaySeconds;
}
// Creates timer which counts elapsed seconds since game start
function startGameTime(startedAt) {
  clearInterval(gameTime);

  // Initial render
  elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  renderTimer(elapsedSeconds);

  gameTime = setInterval(() => {
    elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
    renderTimer(elapsedSeconds);
  }, 1000);
}

function stopGameTime() {
  clearInterval(gameTime);
}
