const jwt = require('jsonwebtoken');

exports.generateToken = async (data) => jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1d' });

