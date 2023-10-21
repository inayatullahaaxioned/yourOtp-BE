const router = require('express').Router();
const { authenticate } = require('../middleware/authentication');

const {
  logHours,
  updateLogHours,
  deleteLogHours,
  logData,
} = require('../controller/users');

router.use(authenticate);

router.get('/', logData);

router.post('/:projectId', logHours);

router.patch('/:logId', updateLogHours);

router.delete('/:logId', deleteLogHours);

module.exports = router;