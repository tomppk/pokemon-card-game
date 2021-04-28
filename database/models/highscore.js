const mongoose = require('mongoose');
const { Schema } = mongoose;

const highscoreSchema = new Schema(
  {
    _id: String,
    player: String,
    guesses: Number,
    gameTime: Number,
  },
  { _id: false }
);

const Highscore = mongoose.model('Highscore', highscoreSchema);

module.exports = Highscore;
