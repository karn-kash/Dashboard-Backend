import { Router } from 'express';
import * as salesController from '../controllers/salesController';

const router = Router();

router.get('/dashboard', salesController.getDashboardData);

router.get('/transactions', salesController.getPaginatedSales);

router.get('/states', salesController.getStates);
router.get('/dates', salesController.getDates);

export default router;