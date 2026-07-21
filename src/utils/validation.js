/**
 * Validates if the given string is a valid email format.
 * 
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  // A standard, robust regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = { isValidEmail };
