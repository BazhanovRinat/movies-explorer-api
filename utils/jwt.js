const jwt = require('jsonwebtoken');

const { NODE_ENV ,JWT_SECRET = 'SECRET_KEY' } = process.env;

const getJwtToken = (payLoad) => jwt.sign(payLoad,  NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

module.exports = { getJwtToken };
