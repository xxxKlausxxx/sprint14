const Card = require('../models/card');

const readCards = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name !== 'ValidationError') {
        res.status(500).send({ message: 'Ошибка сервера' });
      } else {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      }
    });
};

const deleteCard = (req, res) => {
  const cardOwner = req.user._id;
  Card.findById(req.params.id)
    .orFail()
    .then((card) => {
      const owner = card.owner._id.toString();

      if (cardOwner !== owner) {
        res.status(403).send({ message: 'Нельзя удалить чужую карточку' });
      } else {
        Card.deleteOne(card)
          .then(() => res.send({ data: card }))
          .catch(() => {
            res.status(500).send({ message: 'На сервере произошла ошибка' });
          });
      }
    })

    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Нет такой карточки' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный ID' });
      } else { res.status(500).send({ message: 'На сервере произошла ошибка' }); }
    });
};

module.exports = { readCards, createCard, deleteCard };
