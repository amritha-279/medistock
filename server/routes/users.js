const router = require('express').Router();
const { getUsers, createUser, updateUser, deleteUser, resetPassword } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/reset-password', resetPassword);

module.exports = router;
