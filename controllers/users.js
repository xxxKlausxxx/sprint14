const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

const readUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const readUserById = (req, res) => {
  let errStatus = 400;
  User.findById(req.params.id)
    .orFail(() => {
      errStatus = 404;
      throw new ValidationError('Нет пользователя с таким id');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      res.status(errStatus).send({ message: err.message });
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (
    password.length < 8
    || password.split('').every(
      (elem, index, array) => elem === array[0],
    )
  ) {
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
      password,
    }))
    .catch((err) => {
      let errStatus;
      let errMessage;
      if (err.name === 'MongoError' && err.code === 11000) {
        errStatus = 409;
        errMessage = 'Повторный email';
      } else {
        errStatus = 400;
        errMessage = 'Ошибка валидации полей пользователя';
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
