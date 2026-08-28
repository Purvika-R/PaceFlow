const { body, param } = require('express-validator');
const id = () => param('id').isMongoId().withMessage('Invalid user ID');
const create = [body('name').trim().notEmpty().withMessage('Name is required'), body('email').isEmail().withMessage('A valid email is required').normalizeEmail(), body('role').optional().isIn(['developer','manager']).withMessage('Role must be developer or manager')];
module.exports = { id, create };
