const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameSchema = new Schema({
  openCardId: Number,
  cards: Number,
  guesses: Number,
  pairs: Number,
  pairsFound: Number,
  startedAt: Number,
  player: String,
  cardStyle: String,
  finished: Boolean,
  finishedAt: Number,
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;

// let game = {
//   openCardId: null,
//   cards: newDeck(numOfPairs),
//   guesses: 0,
//   pairs: numOfPairs,
//   pairsFound: 0,
//   startedAt: Date.now(),
//   player: username,
//   cardStyle: deckArt,
//   finished: false,
//   finishedAt: null,
// };
