const router = require('express').Router();
const { getDashboard } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getDashboard);

module.exports = router;
