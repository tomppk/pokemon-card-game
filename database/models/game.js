const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameSchema = new Schema({
  openCardId: {
    type: Number,
    default: null,
  },
  cards: [{}],
  guesses: Number,
  pairs: Number,
  pairsFound: Number,
  startedAt: Number,
  player: String,
  cardStyle: String,
  finished: Boolean,
  finishedAt: {
    type: Number,
    default: null,
  },
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
