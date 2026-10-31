import { Router } from 'express';
import * as customerController from './customer.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'staff'), customerController.listCustomers);
router.post('/', authorize('admin', 'staff'), customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', customerController.updateCustomer);

export default router;
