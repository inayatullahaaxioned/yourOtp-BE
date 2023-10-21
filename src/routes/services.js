const router = require('express').Router();
const { authenticate } = require('../middleware/authentication');

const {
  getServers,
  getServiceList,
  buyNumbers,
  cancelNumber,
  anotherSms,
  fetchOtp,
} = require('../controllers/services');

router.use(authenticate);

router.get('/servers', getServers);

router.get('/servicelist/:serverId', getServiceList);

router.post('/buyNumber', buyNumbers);

router.get('/cancelNumber/:service/:activationId', cancelNumber);

router.get('/anotherSms/:activationId', anotherSms);

router.get('/fetchOtp/:activationId', fetchOtp);

module.exports = router;
