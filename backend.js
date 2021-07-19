const path = require('path');
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const { type } = require('os');

const { InMemory, MongoDatabase } = require('./database/');
const { mongo } = require('mongoose');
const InputError = require('./database/models/InputError');
// const session = require('express-session');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

// Middleware to check if user is authorized to access specific game session
const gameAuth = async (req, res, next) => {
  const gameId = req.params.gameId;

  const { sessionId } = req.cookies;

  if (!sessionId) {
    res.status(401);
    res.json({ error: 'No session key found from cookie' });
    return;
  }

  const access = await hasGameAccess(sessionId, gameId);
  if (!access) {
    res.status(403);
    res.json({
      error: 'Access to game forbidden',
      details: `Cannot access gameId: ${gameId} with sessionId: ${sessionId}`,
    });
    return;
  }
  next();
};

// Check that no value is undefined and that there is match in our session storage
const hasGameAccess = async (sessionId, gameId) => {
  return (
    isDefined(sessionId) &&
    isDefined(gameId) &&
    (await mongoStorage.getSessionById(sessionId)) === gameId
    // sessionStorage[sessionId] === gameId
  );
};

// Check that value is not undefined or null
const isDefined = (value) => {
  if (typeof value === 'undefined' || value === null) {
    return false;
  }
  return true;
};

app.post('/api/games', async (req, res, next) => {
  const { username, level, deckArt } = req.body;
  try {
    const game = await getNewGame(username, level, deckArt);
    const sessionId = newSession(game.id);
    res.cookie('sessionId', sessionId);
    res.cookie('gameId', game.id);
    res.json(game);
  } catch (err) {
    next(err);
  }
});

app.get('/api/games/:gameId', gameAuth, async (req, res) => {
  const { gameId } = req.params;
  res.json(await getGame(gameId));
});

app.get('/api/games/:gameId/cards/:cardId', gameAuth, async (req, res) => {
  const { gameId, cardId } = req.params;
  res.json(await getCard(gameId, cardId));
});

app.get('/api/highscores', async (req, res) => {
  const highscores = await mongoStorage.getHighscore();
  res.json(highscores);
});

app.listen(3000, () => {
  console.log('Pokemon card game running on port 3000');
});

// Global middleware to catch errors for all routes
const errorHandler = function (err, req, res, next) {
  if (err instanceof InputError) {
    console.error(req.path, req.method, err);
    res.status(400);
    res.json({ error: err.userMessage });
  } else {
    console.error(req.path, req.method, err);
    res.status(500);
    res.json({ error: 'Internal server error' });
  }
};

// Use middleware to check for errors for all requests
app.use(errorHandler);

// Store game session ids
// const sessionStorage = {};

// Stores game objects and Mongo also stores sessions
// const gameStorage = new InMemory();
const mongoStorage = new MongoDatabase();

// Game difficulty levels. How many pairs of pokemon.
const levels = [
  {
    name: 'easy',
    pairs: 10,
  },
  {
    name: 'medium',
    pairs: 20,
  },
  {
    name: 'hard',
    pairs: 30,
  },
];

// Create unique id for session. Save session id and game id as key: value pairs in session storage
function newSession(gameId) {
  const sessionId = uuidv4();
  mongoStorage.addSession(sessionId, gameId);
  // sessionStorage[sessionId] = gameId;
  return sessionId;
}

// Create new game object with values user inputs in start menu.
// Save original game object to gameStorage array in backend. The original object stores all pokemon ids.
// Pass copy of game object to frontend with pokemon ids set to 0 for cards that are not open.
async function getNewGame(username, level, deckArt) {
  let numOfPairs = 10;
  for (let lvl of levels) {
    if (lvl.name === level) {
      numOfPairs = lvl.pairs;
      break;
    }
  }

  let game = {
    openCardId: null,
    cards: newDeck(numOfPairs),
    guesses: 0,
    pairs: numOfPairs,
    pairsFound: 0,
    startedAt: Date.now(),
    player: username,
    cardStyle: deckArt,
    finished: false,
    finishedAt: null,
  };
  // console.log('inside getnewgame', game);
  // game = gameStorage.addGame(game);
  game = await mongoStorage.addGame(game);

  return userViewOfGame(game);
}

// Make copy of game object and card objects to be passed to frontend
// Mask pokemon id of cards from user view
function userViewOfGame(game) {
  const userGame = Object.assign({}, game);
  userGame.cards = userGame.cards.map((card) => {
    const userCard = Object.assign({}, card);
    if (!userCard.open) {
      userCard.pokemonId = 0;
    }
    return userCard;
  });
  return userGame;
}

// Get game object of index id from gamestorage array
async function getGame(gameId) {
  const game = await mongoStorage.getGameById(gameId);
  return userViewOfGame(game);
}

// Return requested card object and apply required game logic related flipping the card. Compare cards to see if match.
async function getCard(gameId, cardId) {
  const game = await mongoStorage.getGameById(gameId);
  const requestedCard = game.cards[cardId];

  // Check if card already open
  if (requestedCard.open) {
    return requestedCard;
  }

  // Open first card
  if (game.openCardId === null) {
    game.openCardId = cardId;
    requestedCard.open = true;
    await mongoStorage.updateGame(game);
    return requestedCard;
  }

  const previousCard = game.cards[game.openCardId];
  // Open second card. Compare ID's if match cards remain open. If no match cards are turned back around.
  if (requestedCard.pokemonId === previousCard.pokemonId) {
    requestedCard.open = true;
    requestedCard.found = true;
    previousCard.found = true;
    game.pairsFound++;

    if (game.pairsFound === game.pairs) {
      game.finished = true;
      game.finishedAt = Date.now();
      // Total gametime in ms
      const totalGameTime = game.finishedAt - game.startedAt;
      // Save highscore to db and retrieve highscores
      mongoStorage.addHighscore(game.player, game.guesses, totalGameTime);
    }
  } else {
    previousCard.open = false;
  }

  game.guesses++;
  game.openCardId = null;
  await mongoStorage.updateGame(game);

  copyOfRequestedCard = Object.assign({}, requestedCard);
  copyOfRequestedCard.open = true;
  return copyOfRequestedCard;
}

// Get difficulty level
function getLevels() {
  return levels;
}

// Create a deck of pokemon and shuffle pokemon deck
function newDeck(numberOfPokemons) {
  const allPokemons = [];
  for (let i = 1; i < 152; i++) {
    allPokemons.push({
      pokemonId: i,
      open: false,
      found: false,
    });
  }
  shuffleArray(allPokemons);

  const selectedPokemons = allPokemons.slice(0, numberOfPokemons);
  const cards = [
    ...selectedPokemons,
    ...selectedPokemons.map((card) => Object.assign({}, card)),
  ];
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
