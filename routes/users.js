const router = require('express').Router();
const { readUsers, readUserById } = require('../controllers/users');

router.get('/users/:id', readUserById);
router.get('/users', readUsers);

module.exports = router;
