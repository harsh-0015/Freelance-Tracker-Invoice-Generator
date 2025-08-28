const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  freelancerId: { type: String, required: true },
  project: String,
  clientName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: String,
  billableRate: { type: Number, required: true }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Add validation to ensure endTime is after startTime
timeEntrySchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);