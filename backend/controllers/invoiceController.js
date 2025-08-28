const Invoice = require('../models/Invoice');
const TimeEntry = require('../models/TimeEntry');

// Helper function to calculate hours from time entries
const calculateHours = (timeEntries) => {
  return timeEntries.reduce((total, entry) => {
    if (entry.startTime && entry.endTime) {
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours
      return total + hours;
    }
    return total;
  }, 0);
};

// Helper function to transform invoice data for dashboard compatibility
function transformInvoice(invoice) {
  return {
    // Include all original fields
    _id: invoice._id,
    freelancerId: invoice.freelancerId,
    freelancerName: invoice.freelancerName,
    clientName: invoice.clientName,
    project: invoice.project,
    totalHours: invoice.totalHours,
    totalAmount: invoice.totalAmount,
    ratePerHour: invoice.ratePerHour,
    generatedAt: invoice.generatedAt,
    timeEntryIds: invoice.timeEntryIds,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    
    // Add computed fields that dashboard expects
    client: invoice.clientName || 'Unknown Client',           // Dashboard expects 'client'
    amount: invoice.totalAmount || 0,                        // Dashboard expects 'amount'
    date: invoice.generatedAt ? 
      new Date(invoice.generatedAt).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],                // Dashboard expects 'date' in YYYY-MM-DD format
    status: invoice.status || 'pending'                      // Dashboard expects 'status'
  };
}

exports.createInvoice = async (req, res) => {
  try {
    const {
      freelancerId,
      freelancerName,
      clientName,
      project,
      totalHours,
      totalAmount,
      ratePerHour,
      status = 'pending' // Add default status
    } = req.body;

    // Validate required fields
    if (!freelancerId) {
      return res.status(400).json({ error: 'freelancerId is required' });
    }

    if (!clientName) {
      return res.status(400).json({ error: 'clientName is required' });
    }

    if (!totalHours || !totalAmount) {
      return res.status(400).json({ error: 'totalHours and totalAmount are required' });
    }

    const invoiceData = {
      freelancerId,
      freelancerName,
      clientName,
      project,
      totalHours: Math.round(totalHours * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      ratePerHour,
      status: status, // Include status field
      generatedAt: new Date()
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Return transformed invoice
    const transformedInvoice = transformInvoice(invoice);
    res.status(201).json(transformedInvoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all invoices - FIXED VERSION
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('timeEntryIds') // Populate time entries if needed
      .sort({ generatedAt: -1 }); // Sort by newest first
    
    // Transform each invoice to include computed fields that dashboard expects
    const transformedInvoices = invoices.map(invoice => transformInvoice(invoice));
    
    res.json(transformedInvoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('timeEntryIds');
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const transformedInvoice = transformInvoice(invoice);
    res.json(transformedInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get top clients by invoice count or total amount
exports.getTopClients = async (req, res) => {
  try {
    const topClients = await Invoice.aggregate([
      {
        $group: {
          _id: '$clientName',
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { totalInvoices: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 1,
          name: { 
            $cond: { 
              if: { 
                $or: [
                  { $eq: ['$_id', null] }, 
                  { $eq: ['$_id', ''] },
                  { $eq: ['$_id', undefined] }
                ] 
              }, 
              then: 'Unnamed Client', 
              else: '$_id' 
            } 
          },
          totalInvoices: 1,
          totalAmount: 1
        }
      }
    ]);
    
    res.json(topClients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};