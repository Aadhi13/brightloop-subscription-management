import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// All user management routes require admin privileges
router.use(authenticate, authorize('admin'));

router.post('/staff', userController.createStaff);
router.get('/', userController.getUsers);
router.patch('/:id/status', userController.updateStatus);

export default router;
