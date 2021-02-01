const path = require('path');
const express = require('express');
const app = express();

app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.json());

app.post('/api/games', (req, res) => {
    const { username, level, deckArt } = req.body;
    console.log(req.body)
    res.json(getNewGame(username, level, deckArt));
})

app.post('/api/games/:id', (req, res) => {
    const { id } = req.body;
    res.json(getGameById(id));
})

app.post('/api/games/:id/cards/:cardId', (req, res) => {
    const { gameId, cardId } = req.body;
    console.log('gameId:', gameId, 'cardId:', cardId)
    res.json(getCard(gameId, cardId));
})

app.get('/api/levels', (req, res) => {
    res.send('TEST OK!')
})

app.listen(3000, () => {
    console.log('Pokemon card game running on port 3000')
})

// Store game objects
const gameStorage = [];

// Game difficulty levels. How many pairs of pokemon.
const levels = [
    {
        name: 'easy',
        pairs: 10
    },
    {
        name: 'medium',
        pairs: 20
    },
    {
        name: 'hard',
        pairs: 30
    }
]

// Create new game object with values user inputs in start menu.
// Save original game object to gameStorage array in backend. The original object stores all pokemon ids.
// Pass copy of game object to frontend with pokemon ids set to 0 for cards that are not open.
function getNewGame(username, level, deckArt) {
    let numOfPairs = 10;
    for (let lvl of levels) {
        if (lvl.name === level) {
            numOfPairs = lvl.pairs
            break;
        }
    }

    const game = {
        id: gameStorage.length,
        openCardId: null,
        cards: newDeck(numOfPairs),
        guesses: 0,
        pairs: numOfPairs,
        pairsFound: 0,
        startedAt: Date.now(),
        player: username,
        cardStyle: deckArt,
        finished: false
    }

    gameStorage.push(game);

    return userViewOfGame(game);
}

// Make copy of game object and card objects to be passed to frontend
// Mask pokemon id of cards from user view
function userViewOfGame(game) {
    const userGame = Object.assign({}, game);
    userGame.cards = userGame.cards.map(card => {
        const userCard = Object.assign({}, card)
        if (!userCard.open) {
            userCard.pokemonId = 0;
        }
        return userCard;
    })
    return userGame;
}

// Get game object of index id from gamestorage array
function getGameById(id) {
    return userViewOfGame(gameStorage[id]);
}

// Return requested card object and apply required game logic related flipping the card. Compare cards to see if match.
function getCard(gameId, cardId) {
    const game = gameStorage[gameId];
    const requestedCard = game.cards[cardId];

    // Check if card already open
    if (requestedCard.open) {
        return requestedCard;
    }

    // Open first card
    if (game.openCardId === null) {
        game.openCardId = cardId;
        requestedCard.open = true;
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
        }
    } else {
        previousCard.open = false;
    }

    game.guesses++;
    game.openCardId = null;
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
            found: false
        });
    }
    shuffleArray(allPokemons);

    const selectedPokemons = allPokemons.slice(0, numberOfPokemons);
    const cards = [...selectedPokemons, ...selectedPokemons.map(card => Object.assign({}, card))];
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
