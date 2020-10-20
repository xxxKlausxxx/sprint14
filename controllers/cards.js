const Card = require('../models/card');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

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
  let errStatus = 400;
  Card.findByIdAndRemove(req.params.id)
    .orFail(() => {
      errStatus = 404;
      throw new ValidationError('Нет карточки с таким id');
    })
    .then((card) => {
      if (req.user._id === card.owner._id.toString()) {
        const cardDeleted = card;
        Card.deleteOne(card)
          .orFail(() => {
            errStatus = 500;
            throw new ValidationError('Сбой сервера');
          })
          .then(() => res.send({ data: cardDeleted }))
          .catch(() => res.status(errStatus).send({ message: 'Неопределенная ошибка' }));
      } else {
        errStatus = 403;
        throw new Error('Нельзя удалить чужую карточку');
      }
    })
    .catch(() => res.status(errStatus).send({ message: 'Ошибка' }));
};
module.exports = { readCards, createCard, deleteCard };
