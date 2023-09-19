const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'SECRET_KEY' } = process.env;

const getJwtToken = (payLoad) => jwt.sign(payLoad, JWT_SECRET, { expiresIn: '7d' });

module.exports = { getJwtToken };
