const router = require('express').Router();
const { readCards, createCard, deleteCard } = require('../controllers/cards');

router.post('/cards', createCard);
router.get('/cards', readCards);
router.delete('/cards/:id', deleteCard);

module.exports = router;
