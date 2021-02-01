

// Create new game object with values user inputs in start menu.
// Save original game object to gameStorage array in backend. The original object stores all pokemon ids.
// Pass copy of game object to frontend with pokemon ids set to 0 for cards that are not open.
async function startNewGame(username, level, deckArt) {
    try {
        const gameParameters = {
            username: username,
            level: level,
            deckArt: deckArt
        };

        const res = await fetch('/api/games', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameParameters)
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error:', error)
    }

}


// Get game object of index id from gamestorage array
async function getGameById(id) {
    try {
        const gameId = {
            id: id
        };

        const res = await fetch(`/api/games/${id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameId)
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error: ', error)
    }
}


// Return requested card object and apply required game logic related flipping the card. Compare cards to see if match.
async function getCard(gameId, cardId) {
    try {
        const cardParameters = {
            gameId: gameId,
            cardId: cardId
        };

        const res = await fetch(`/api/games/${gameId}/cards/${cardId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cardParameters)
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error:', error)
    }
}

// Get difficulty levels that are possible to choose
// function getLevels() {
// }
