const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/aiController');
router.post('/generate-tasks', [body('goal').isString().trim().isLength({ min: 4, max: 2000 }), body('count').optional().isInt({ min: 1, max: 6 }), body('project').isMongoId().withMessage('A valid project is required'), body('generationId').isUUID().withMessage('A generation ID is required')], validate, controller.generateTasks);
router.get('/priorities', controller.suggestPriorities);
module.exports = router;
