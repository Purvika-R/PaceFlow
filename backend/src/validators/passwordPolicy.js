// Shared password-policy regex — 8–15 chars, must include uppercase, lowercase, digit, and special character.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/;
const PASSWORD_MESSAGE = 'Password must be 8–15 characters and include uppercase, lowercase, number, and special character.';

module.exports = { PASSWORD_RULE, PASSWORD_MESSAGE };
