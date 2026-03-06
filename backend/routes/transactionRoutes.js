import express from 'express';
import { requestPurchase, getBuyerTransactions, getFarmerTransactions, updateTransactionStatus } from '../controllers/transactionController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, authorizeRoles('Buyer'), requestPurchase);
router.get('/buyer', protect, authorizeRoles('Buyer'), getBuyerTransactions);
router.get('/farmer', protect, authorizeRoles('Farmer'), getFarmerTransactions);
router.put('/:id', protect, updateTransactionStatus);

export default router;
