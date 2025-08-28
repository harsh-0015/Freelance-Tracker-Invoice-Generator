const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeEntryController');

// Time entry routes
router.post('/', timeEntryController.createTimeEntry);
router.get('/', timeEntryController.getAllTimeEntries);
router.get('/:id', timeEntryController.getTimeEntryById);
router.put('/:id', timeEntryController.updateTimeEntry);
router.delete('/:id', timeEntryController.deleteTimeEntry);

module.exports = router;