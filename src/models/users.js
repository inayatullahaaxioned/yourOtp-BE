const { Schema, model, default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 30,
    required: true
  },
  email: {
    type: String,
    minLength: 3,
    maxLength: 30,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    min: 0,
    default: 0,
  },
  totalOtp: {
    type: Number,
    min: 0,
    default: 0,
  },
  totalRecharge: {
    type: Number,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function hashing() {
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = model('user', UserSchema);

UserSchema.clearIndexes({ name: 1 });
