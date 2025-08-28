const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// ✅ CORRECT ORDER in invoiceRoutes.js
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/top-clients', invoiceController.getTopClients);  // SPECIFIC route FIRST
router.get('/:id', invoiceController.getInvoiceById);         // PARAMETER route LAST
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
