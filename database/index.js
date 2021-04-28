const deepcopy = require('deepcopy');
const mongoose = require('mongoose');
const Game = require('./models/game');
const Session = require('./models/session');
const Highscore = require('./models/highscore');

// In memory database. Stores game objects in an array
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

// External database. Stores game objects inside MongoDB
class MongoDatabase {
  // Set up connection to database
  constructor() {
    mongoose.connect('mongodb://localhost:27017/pokemon', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('Database connected');
    });
  }

  // Add new Game object into database. Add id to game
  addGame(game) {
    try {
      const copyOfGame = new Game(game);
      game['id'] = copyOfGame._id.toString();

      copyOfGame.save((err) => {
        if (err) {
          return console.log('Error while saving to database', err);
        }
      });

      return game;
    } catch (err) {
      return console.log('Error while saving to database', err);
    }
  }

  // Find game from database and return it as Javascript object
  async getGameById(gameId) {
    try {
      let game = (await Game.findById(gameId)).toObject();
      game['id'] = game._id;
      delete game._id;
      return game;
    } catch (err) {
      return console.log('Error could not retrieve game from database', err);
    }
  }

  async updateGame(game) {
    try {
      let updatedGame = (
        await Game.findByIdAndUpdate(game.id, game)
      ).toObject();
      updatedGame['id'] = updatedGame._id;
      delete updatedGame._id;
      return updatedGame;
    } catch (err) {
      return console.log('Error could not update game in database', err);
    }
  }

  // Add new Session to database. Add gameId to session
  addSession(sessionId, gameId) {
    try {
      const session = new Session({ _id: sessionId, gameId: gameId });
      session.save((err) => {
        if (err) {
          return console.log('Error while saving session to database', err);
        }
      });
    } catch (err) {
      return console.log('Error could not save session to database', err);
    }
  }

  // Find session from database and return a promise with gameId
  async getSessionById(sessionId) {
    try {
      let session = await Session.findById(sessionId);
      return session.gameId;
    } catch (err) {
      return console.log('Error could not retrieve session from database', err);
    }
  }

  // Save new Highscore to database.
  async addHighscore(player, guesses, gametime) {
    try {
      const highscore = new Highscore({
        player: player,
        guesses: guesses,
        gametime: gametime,
      });
      await highscore.save((err) => {
        if (err) {
          return console.log('Error while saving highscore to database', err);
        }
      });
    } catch (err) {
      return console.log('Error could not save highscore to database', err);
    }
  }

  // Find highscores, sort them, and return top 10
  // Aggregates all highscores together into an array
  // sorts them in ascending order ie. small to big
  // First sort according to least amount of guesses. If amount of guesses
  // are same for two players, then sort according to gametime who was faster.
  // limits the array items to 10
  async getHighscore() {
    try {
      let highscores = await Highscore.aggregate([
        { $sort: { guesses: 1, gametime: 1 } },
        { $limit: 10 },
      ]);
      console.log(highscores);
      return highscores;
    } catch (err) {
      return console.log(
        'Error could not retrieve highscores from database',
        err
      );
    }
  }
}

module.exports = { InMemory, MongoDatabase };

// RETURNED ARRAY OF HIGHSCORES
// [
//   {
//     _id: 608989a060c9c24700dac6c7,
//     player: 'master',
//     guesses: 14,
//     gametime: 53757,
//     __v: 0
//   },
//   {
//     _id: 60898c1a4a971f49510279b6,
//     player: 'johson',
//     guesses: 15,
//     gametime: 57041,
//     __v: 0
//   },
//   {
//     _id: 608987f496c69745be60193a,
//     player: 'tom',
//     guesses: 16,
//     gametime: 1619625972111,
//     __v: 0
//   },
//   {
//     _id: 608988bd96c69745be60193c,
//     player: 'newgamer',
//     guesses: 23,
//     gametime: 1619626173524,
//     __v: 0
//   }
// ]
