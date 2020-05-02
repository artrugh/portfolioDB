const createError = require('http-errors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateAuthToken = (next, username) => {
    try {
        const token = jwt.sign(
            { username: username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return token

    } catch (err) {
        next(err)
    }
};

const findByToken = token => {

    let decoded;

    try {

        decoded = jwt.verify(token, process.env.JWT_SECRET);

    } catch (err) {
        return;
    }

    return decoded.username;
};


exports.auth = async (req, res, next) => {

    try {
        const token = req.cookies.token;
        if (!token) throw new createError(401);
        const username = await findByToken(token);
        if (username !== process.env.username) res.redirect('/')
        next();
    } catch (err) {
        next(err);
    }
};