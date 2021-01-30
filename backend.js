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

function getGameById(id) {
    return userViewOfGame(gameStorage[id]);
}

function getCard(gameId, cardId) {
    const game = gameStorage[gameId];
    const requestedCard = game.cards[cardId];

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

function getLevels() {
    return levels;
}

// Create a deck of pokemon and shuffle pokemon deck
function newDeck(numberOfPokemons) {
    const allPokemons = [];
    for (let i = 1; i < 152; i++) {
        allPokemons.push({
            pokemonId: i,
            open: false
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
