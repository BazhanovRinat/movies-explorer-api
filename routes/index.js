const router = require('express').Router();

const usersRouter = require('./users');
const moviesRouter = require('./movies');

router.use(usersRouter);
router.use(moviesRouter);

module.exports = router;
