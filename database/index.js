const deepcopy = require('deepcopy');
const mongoose = require('mongoose');

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

class MongoDatabase {
  constructor() {
    mongoose.connect('mongodb://localhost:27017/pokemon', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('Database connected');
    });
  }
}

module.exports = { InMemory, MongoDatabase };
