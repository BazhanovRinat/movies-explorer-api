const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const { getJwtToken } = require('../utils/jwt');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFound = require('../errors/notFound-error');
const BadRequest = require('../errors/badRequest-error');
const Conflict = require('../errors/conflict-error');

const SALT_ROUNDS = 10;

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            throw new NotFound('Пользователь не найден');
        }
        res.status(200).send(user);
    } catch (err) {
        next(err);
    }
};

const patchUser = async (req, res, next) => {
    const { email, name } = req.body;

    try {
        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            { email, name },
            { new: true, runValidators: true }
        );
        if (!user) {
            throw new NotFound('Пользователь не найден');
        }
        res.status(200).send({ email, name });
    } catch (err) {
        if (err.name === 'ValidationError') {
            next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
        } else {
            next(err);
        }
    }
};

const register = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await userModel.create({
            name,
            email,
            password: hash,
        });

        const userNoPassword = user.toObject();
        delete userNoPassword.password;

        res.status(201).send(userNoPassword);
    } catch (err) {
        if (err.code === 11000) {
            next(new Conflict('Такой пользователь уже существует'));
        } else if (err.name === 'ValidationError') {
            next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
        } else {
            next(err);
        }
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            throw new UnauthorizedError('Пользователь не найден');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedError('Пароль не верный');
        }

        const token = getJwtToken({ _id: user._id });
        // можно сделать через куки
        // res.cookie('jwt', token, {
        //   maxAge: 3600000 * 24 * 7,
        //   httpOnly: true,
        // });
        res.status(200).send({ token });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getCurrentUser,
    patchUser,
    register,
    login,
};
