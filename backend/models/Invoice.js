const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  freelancerId: { type: String, required: true },
  freelancerName: { type: String },
  clientName: { type: String, required: true },
  project: { type: String },
  totalHours: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  ratePerHour: { type: Number },
  generatedAt: { type: Date, default: Date.now },
  
  // Add status field that dashboard expects
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  
  // Optional fields for future time tracking integration
  timeEntryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TimeEntry' }],
  hoursBilled: Number,
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Invoice', invoiceSchema);