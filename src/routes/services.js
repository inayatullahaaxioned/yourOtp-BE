const router = require('express').Router();
const { authenticate } = require('../middleware/authentication');

const {
  getServers,
  getServiceList,
  buyNumbers,
  cancelNumber,
} = require('../controllers/services');

router.use(authenticate);

router.get('/servers', getServers);

router.get('/servicelist/:serverId', getServiceList);

router.post('/buyNumber', buyNumbers);

router.post('/cancelNumber/:activationId', cancelNumber);

module.exports = router;
