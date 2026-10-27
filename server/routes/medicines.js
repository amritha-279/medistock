const router = require('express').Router();
const { getAll, getOne, create, update, remove, getCategories } = require('../controllers/medicineController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/categories', getCategories);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
