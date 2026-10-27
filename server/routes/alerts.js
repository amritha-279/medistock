const router = require('express').Router();
const { getAll, markRead, resolve, generateAlerts } = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAll);
router.post('/generate', generateAlerts);
router.put('/:id/read', markRead);
router.put('/:id/resolve', resolve);

module.exports = router;
