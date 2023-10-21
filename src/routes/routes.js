const router = require('express').Router();
const authRoute = require('./auth');
const serviceRoute = require('./services');

router.use('/auth', authRoute);

router.use('/service', serviceRoute);

module.exports = router;
