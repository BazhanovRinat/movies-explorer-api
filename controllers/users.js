const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const { getJwtToken } = require('../utils/jwt');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFound = require('../errors/notFound-error');
const BadRequest = require('../errors/badRequest-error');
const Conflict = require('../errors/conflict-error');

const SALT_ROUNDS = 10;

const getCurrentUser = (req, res, next) => {
    userModel.findById(req.user._id)
        .then((user) => {
            if (!user) return next(new NotFound('Пользователь не найден'));
            return res.status(200).send(user);
        })
        .catch((err) => {
            next(err);
        });
};

const patchUser = (req, res, next) => {
    const { email, name } = req.body;

    return userModel.findByIdAndUpdate(req.user._id, { email, name },
        { new: true, runValidators: true })
        .then((user) => {
            if (!user) {
                return next(new NotFound('Пользователь не найден'));
            }
            return res.status(200).send({ email, name });
        })
        .catch((err) => {
            if (err.name === 'ValidationError') {
                return next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
            }
            return next(err);
        });
};

const register = (req, res, next) => {
    const {
        name,
        email,
        password,
    } = req.body;

    return bcrypt.hash(password, SALT_ROUNDS)
        .then((hash) => userModel.create({
            name,
            email,
            password: hash,
        }))
        .then((user) => {
            const userNoPassword = user.toObject();
            delete userNoPassword.password;

            return res.status(201).send(userNoPassword);
        })
        .catch((err) => {
            if (err.code === 11000) {
                return next(new Conflict('Такой пользователь уже существует'));
            }
            if (err.name === 'ValidationError') {
                return next(new BadRequest(`${Object.values(err.errors).map((errror) => errror.message).join(', ')}`));
            }
            return next(err);
        });
};

const login = (req, res, next) => {
    const { email, password } = req.body;

    return userModel.findOne({ email }).select('+password')
        .then((user) => {
            if (!user) {
                return next(new UnauthorizedError('Пользователь не найден'));
            }
            return bcrypt.compare(password, user.password)
                .then((isValidPassword) => {
                    if (!isValidPassword) {
                        return next(new UnauthorizedError('Пароль не верный'));
                    }
                    const token = getJwtToken({ _id: user._id });
                    // можно сделать через куки
                    // return res.cookie('jwt', token, {
                    //   maxAge: 3600000 * 24 * 7,
                    //   httpOnly: true,
                    // });
                    return res.status(200).send({ token });
                });
        })
        .catch((err) => {
            next(err);
        });
};

module.exports = {
    getCurrentUser,
    patchUser,
    register,
    login,
};
