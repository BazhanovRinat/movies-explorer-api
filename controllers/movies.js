const movieModel = require('../models/movie');
const NotFound = require('../errors/notFound-error');
const BadRequest = require('../errors/badRequest-error');
const Forbidden = require('../errors/forbidden-error');

const getSavedMovies = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const movies = await movieModel.find({ owner: userId });
        res.status(200).send(movies);
    } catch (err) {
        next(err);
    }
};

const createMovie = async (req, res, next) => {
    const userId = req.user._id;
    const {
        country, director, duration, year, description, image,
        trailer, nameRU, nameEN, thumbnail, movieId,
    } = req.body;

    try {
        const movie = await movieModel.create({
            country, director, duration, year, description, image,
            trailer, nameRU, nameEN, thumbnail, movieId, owner: userId,
        });
        res.status(201).send(movie);
    } catch (err) {
        if (err.name === 'ValidationError') {
            next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
        } else {
            next(err);
        }
    }
};

const deleteMovie = async (req, res, next) => {
    const { movieId } = req.params;

    try {
        const movie = await movieModel.findById(movieId);
        if (!movie) {
            return next(new NotFound('Фильм не найден'));
        }
        if (req.user._id !== movie.owner._id.toString()) {
            return next(new Forbidden('Нельзя удалить чужой фильм'));
        }
        await movie.deleteOne();
        res.status(200).send({ message: 'Фильм удален' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSavedMovies,
    createMovie,
    deleteMovie,
};
