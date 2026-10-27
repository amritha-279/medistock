const router = require('express').Router();
const { inventoryReport, salesReport, expiryReport, demandReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/inventory', inventoryReport);
router.get('/sales', salesReport);
router.get('/expiry', expiryReport);
router.get('/demand', demandReport);

module.exports = router;
