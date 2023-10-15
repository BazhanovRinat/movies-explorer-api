const movieModel = require('../models/movie');
const NotFound = require('../errors/notFound-error');
const BadRequest = require('../errors/badRequest-error');
const Forbidden = require('../errors/forbidden-error');

const getMovies = (req, res, next) => {
    const userId = req.user._id; 

    movieModel.find({ owner: userId }) 
        .then((movies) => res.status(200).send(movies))
        .catch((err) => next(err));
};

const createMovie = (req, res, next) => {
    const userId = req.user._id;
    const { country, director, duration, year, description, image,
        trailerLink, nameRU, nameEN, thumbnail, movieId } = req.body;

    return movieModel.create({
        country, director, duration, year, description, image,
        trailerLink, nameRU, nameEN, thumbnail, movieId, owner: userId
    })
        .then((movie) => res.status(201).send(movie))
        .catch((err) => {
            if (err.name === 'ValidationError') {
                return next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
            }
            return next(err);
        });
};

const deleteMovie = (req, res, next) => {
    const { movieId } = req.params;

    return movieModel.findById(movieId)
        .then((movie) => {
            if (!movie) {
                return next(new NotFound('Фильм не найден'));
            }
            if (req.user._id !== movie.owner._id.toString()) {
                return next(new Forbidden('Нельзя удалить чужой фильм'));
            }
            return movie.deleteOne()
                .then(() => res.status(200).send({ message: 'Фильм удален' }));
        })
        .catch((err) => {
            next(err);
        });
};

module.exports = {
    getMovies,
    createMovie,
    deleteMovie,
};
