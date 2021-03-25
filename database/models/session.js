const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema(
  {
    _id: String,
    gameId: String,
  },
  { _id: false }
);

const Session = mongoose.Model('Session', sessionSchema);

module.exports = Session;
