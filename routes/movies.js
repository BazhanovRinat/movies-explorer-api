const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const auth = require('../middlewares/auth');

const {
    getMovies,
    createMovie,
    deleteMovie,
} = require('../controllers/movies');

router.use(auth);

router.get('/movies', getMovies);

router.post('/movies', celebrate({
    body: Joi.object().keys({
        country: Joi.string().required(),
        director: Joi.string().required(),
        duration: Joi.number().required(),
        year: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required().pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?\.(jpeg|jpg|png)$/i),
        trailerLink: Joi.string().required().pattern(/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/),
        thumbnail: Joi.string().required().pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?\.(jpeg|jpg|png)$/i),
        owner: Joi.string().required(),
        movieId: Joi.number().required(),
        nameRU: Joi.string().required(),
        nameEN: Joi.string().required(),
    }),
}), createMovie);

router.delete('/movies/:movieId', celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().required(),
    }),
  }),
  deleteMovie);

module.exports = router;
