const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const readUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const readUserById = (req, res) => {
  User.findById(req.params.id)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь не найден' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный ID' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!password || password.length < 8) {
    res.status(400).send({ message: 'Пароль не соответствует требованиям' });
    return;
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      let errStatus;
      let errMessage;
      if (err.name === 'MongoError' && err.code === 11000) {
        errStatus = 409;
        errMessage = 'Повторный email';
      } else if (err.name === 'ValidationError') {
        errStatus = 400;
        errMessage = 'Ошибка валидации полей пользователя';
      } else {
        errStatus = 500;
        errMessage = 'На сервере произошла ошибка';
      }
      res.status(errStatus).send({ message: errMessage });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-super-secret',
        { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .end();
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

module.exports = {
  readUsers, createUser, readUserById, login,
};
