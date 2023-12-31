const { Schema, model, default: mongoose } = require('mongoose');

const priceSchema = new Schema({
  service: {
    type: String,
    maxLength: 5,
    required: true
  },
  name: {
    type: String,
    maxLength: 30,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = model('price', priceSchema);

priceSchema.clearIndexes({ service: 1 });
