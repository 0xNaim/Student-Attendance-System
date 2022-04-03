const { findUserByProperty, createNewUser } = require('./user');
const bcrypt = require('bcryptjs');
const error = require('../utils/error');
const jwt = require('jsonwebtoken');

// Register service
const registerService = async ({ name, email, password, roles }) => {
  let user = await findUserByProperty('email', email);
  if (user) throw error('User already exist', 400);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return createNewUser({ name, email, password: hash, roles });
};

const loginService = async ({ email, password }) => {
  const user = await findUserByProperty('email', email);
  if (!user) throw error('Invalid credential', 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw error('Invalid credential', 400);

  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    accountStatus: user.accountStatus,
  };
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '2h' });
};

module.exports = {
  registerService,
  loginService,
};
