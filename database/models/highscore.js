const mongoose = require('mongoose');
const { Schema } = mongoose;

const highscoreSchema = new Schema({
  player: String,
  guesses: Number,
  gametime: Number,
});

const Highscore = mongoose.model('Highscore', highscoreSchema);

module.exports = Highscore;
