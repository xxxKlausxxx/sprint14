const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.set('runValidators', true);

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/', cardsRouter);
app.use('/users', usersRouter);
app.use('/', (req, res) => {
  res.set({ 'content-type': 'application/json; charset=utf-8' });
  res.status(404).end({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {

});
