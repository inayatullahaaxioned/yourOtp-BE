const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const joi = require('joi');
const { generateToken } = require('../helpers/utils');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const schema = joi.object({
      name: joi.string()
        .required()
        .pattern(/^[a-zA-Z\s]+$/).message('Please enter valid name'),
      email: joi.string()
        .email()
        .required()
        .lowercase()
        .message('Please enter valid email'),
      password: joi.string()
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .message('Password must contain atleast one lowercase, uppercase, one number and a special character'),
      role: joi.string().valid('user', 'admin'),
    });

    const result = schema.validate(req.body);

    if (result.error) {
      return res.status(400).send({
        error: result.error.message,
      });
    }

    const existingUser = await mongoose.model('user').countDocuments({ email });

    if (existingUser) {
      return res.status(404).send({
        error: 'User already exists.',
      });
    }

    await mongoose.model('user').create({
      name,
      email,
      password,
    });
    return res.status(200).send({
      message: 'Registered Successfully. You can login now.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const schema = joi.object({
      email: joi.string()
        .email()
        .required()
        .error(new Error('Please enter a valid email.')),
      password: joi.string().required().min(4),
    });
    const result = schema.validate(req.body);

    if (result.error) {
      return res.status(400).send({
        error: result.error.message,
      });
    }

    const existingUser = await mongoose.model('user').findOne({
      email,
    });

    if (!existingUser) {
      return res.status(404).send({
        error: 'User does not exists.',
      });
    }

    const checkPassword = await bcrypt.compare(password, existingUser.password);
    if (!checkPassword) {
      return res.status(400).send({
        error: 'Please Enter valid Password',
      });
    }

    const token = await generateToken({
      _id: existingUser._id,
      name: existingUser.name,
      email,
    });

    return res.status(200).send({
      message: 'Loggedin Successfully.',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error.',
    });
  }
};
