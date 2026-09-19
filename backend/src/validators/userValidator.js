const { body, param } = require('express-validator');
const { PASSWORD_RULE, PASSWORD_MESSAGE } = require('./passwordPolicy');

const id = () => param('id').isMongoId().withMessage('Invalid user ID');

const create = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').matches(PASSWORD_RULE).withMessage(PASSWORD_MESSAGE),
  body('role').optional().isIn(['developer', 'manager']).withMessage('Role must be developer or manager'),
];

const update = [
  id(),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().isIn(['developer', 'manager']).withMessage('Role must be developer or manager'),
  body('theme').optional().isIn(['dark', 'light']).withMessage('Theme must be dark or light'),
  body('remindersEnabled').optional().isBoolean().withMessage('Reminders enabled must be boolean'),
];

module.exports = { id, create, update };
