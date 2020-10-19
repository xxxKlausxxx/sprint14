const router = require('express').Router();
const { readUsers, readUserById } = require('../controllers/users');

router.get('/:id', readUserById);
router.get('/', readUsers);

module.exports = router;
