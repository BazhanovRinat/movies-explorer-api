const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const auth = require('../middlewares/auth');

const {
    getSavedMovies,
    createMovie,
    deleteMovie,
} = require('../controllers/movies');

router.use(auth);

router.get('/movies', getSavedMovies);

router.post('/movies', celebrate({
    body: Joi.object().keys({
        country: Joi.string().required(),
        director: Joi.string().required(),
        duration: Joi.number().required(),
        year: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required().pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/),
        trailerLink: Joi.string().required().pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/),
        thumbnail: Joi.string().required().pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/),
        owner: Joi.string().required(),
        movieId: Joi.number().required(),
        nameRU: Joi.string().required(),
        nameEN: Joi.string().required(),
    }),
}), createMovie);

router.delete('/movies/:_id', celebrate({
    params: Joi.object().keys({
        movieId: Joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('objectId.invalid');
            }
            return value;
        }).message('Некорректный ID фильма'),
    }),
}), deleteMovie);

module.exports = router;
