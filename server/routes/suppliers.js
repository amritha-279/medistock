const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authorize('admin', 'manager'), create);
router.put('/:id', authorize('admin', 'manager'), update);
router.delete('/:id', authorize('admin'), remove);

module.exports = router;
