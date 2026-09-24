const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'medipredict_super_secret_jwt_key_2026_btech_final_year',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = generateToken;
