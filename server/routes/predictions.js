const router = require('express').Router();
const { predictDemand, predictExpiryRisk, getHistory, getMetrics, retrainModel } = require('../controllers/predictionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.post('/demand', predictDemand);
router.post('/expiry-risk', predictExpiryRisk);
router.get('/history', getHistory);
router.get('/metrics', authorize('admin'), getMetrics);
router.post('/retrain/:type', authorize('admin'), retrainModel);

module.exports = router;
