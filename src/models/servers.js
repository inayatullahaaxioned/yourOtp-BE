const { Schema, model, default: mongoose } = require('mongoose');

const serverSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    maxLength: 30,
    required: true
  },
  id: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = model('server', serverSchema);

serverSchema.clearIndexes({ service: 1 });
