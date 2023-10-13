const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const router = require('./routes/index');
const errorHandler = require('./errors/errorHandler');
const NotFound = require('./errors/notFound-error');
const cors = require('cors');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3001, MONGODB_URL = 'mongodb://127.0.0.1:27017/movies-explorerdb' } = process.env;

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
}).then(() => {
  console.log('connected to db');
});

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(limiter);

app.use(helmet());

app.use(express.json());

app.use(requestLogger);

app.use(router);

app.use((req, res, next) => next(new NotFound('Страница не найдена')));

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
