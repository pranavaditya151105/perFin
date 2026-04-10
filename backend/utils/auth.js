const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const ApiError = require('./ApiError');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const createAccessToken = (data) => {
  return jwt.sign(data, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

const decodeAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

const getCurrentUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, "Could not validate credentials"));
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeAccessToken(token);

  if (!payload) {
    return next(new ApiError(401, "Could not validate credentials"));
  }

  req.user = payload;
  next();
};

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  decodeAccessToken,
  getCurrentUser,
};
