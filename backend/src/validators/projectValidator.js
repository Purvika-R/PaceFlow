const { body, param } = require('express-validator');
const id = () => param('id').isMongoId().withMessage('Invalid project ID');
const fields = [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'), body('description').optional().isString(), body('owner').optional().isMongoId().withMessage('Owner must be a valid User ID'), body('status').optional().isIn(['active','completed','archived']).withMessage('Invalid project status')];
const create = [body('name').trim().notEmpty().withMessage('Name is required'), body('owner').isMongoId().withMessage('Owner must be a valid User ID'), body('description').optional().isString(), body('status').optional().isIn(['active','completed','archived']).withMessage('Invalid project status')];
module.exports = { id, create, update: fields };
