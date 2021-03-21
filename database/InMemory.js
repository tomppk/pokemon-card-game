const deepcopy = require('deepcopy');

class InMemory {
  gameStorage = [];

  // Adds incremental id to game and stores copy of game to storage
  addGame(game) {
    game['id'] = this.gameStorage.length;
    const gameCopy = deepcopy(game);
    this.gameStorage.push(gameCopy);
    return game;
  }

  // Returns copy of game from storage
  getGameById(gameId) {
    return deepcopy(this.gameStorage[gameId]);
  }

  // Updates game in storage with values of copy
  updateGame(game) {
    this.gameStorage[game.id] = deepcopy(game);
    return game;
  }
}

module.exports.InMemory = InMemory;
