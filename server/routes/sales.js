const router = require('express').Router();
const { getAll, getOne, create, getMonthlySales } = require('../controllers/salesController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/monthly', getMonthlySales);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);

module.exports = router;
