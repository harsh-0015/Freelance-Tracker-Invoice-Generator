const TimeEntry = require('../models/TimeEntry');

// Create a new time entry
exports.createTimeEntry = async (req, res) => {
  try {
    console.log('Received data:', req.body); // Debug log
    
    const { freelancerId, project, clientName, startTime, endTime, description, billableRate } = req.body;
    
    // Validate required fields
    if (!freelancerId) {
      return res.status(400).json({ error: 'freelancerId is required' });
    }
    if (!clientName) {
      return res.status(400).json({ error: 'clientName is required' });
    }
    if (!startTime) {
      return res.status(400).json({ error: 'startTime is required' });
    }
    if (!endTime) {
      return res.status(400).json({ error: 'endTime is required' });
    }
    if (!billableRate) {
      return res.status(400).json({ error: 'billableRate is required' });
    }

    // Validate that endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const timeEntry = new TimeEntry({
      freelancerId,
      project,
      clientName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      description,
      billableRate: parseFloat(billableRate)
    });

    await timeEntry.save();
    
    // Transform the response to include computed fields
    const transformedEntry = transformTimeEntry(timeEntry);
    
    res.status(201).json(transformedEntry);
  } catch (err) {
    console.error('Controller error:', err); // Debug log
    res.status(400).json({ error: err.message });
  }
};

// Get all time entries
exports.getAllTimeEntries = async (req, res) => {
  try {
    const entries = await TimeEntry.find().sort({ createdAt: -1 });
    
    // Transform each entry to include computed fields that dashboard expects
    const transformedEntries = entries.map(entry => transformTimeEntry(entry));
    
    res.json(transformedEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single time entry by ID
exports.getTimeEntryById = async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    const transformedEntry = transformTimeEntry(entry);
    res.json(transformedEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update time entry
exports.updateTimeEntry = async (req, res) => {
  try {
    const { freelancerId, project, clientName, startTime, endTime, description, billableRate } = req.body;
    
    // Validate that endTime is after startTime if both are provided
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const updateData = {};
    if (freelancerId !== undefined) updateData.freelancerId = freelancerId;
    if (project !== undefined) updateData.project = project;
    if (clientName !== undefined) updateData.clientName = clientName;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (description !== undefined) updateData.description = description;
    if (billableRate !== undefined) updateData.billableRate = parseFloat(billableRate);

    const entry = await TimeEntry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    const transformedEntry = transformTimeEntry(entry);
    res.json(transformedEntry);
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Delete time entry
exports.deleteTimeEntry = async (req, res) => {
  try {
    const entry = await TimeEntry.findByIdAndDelete(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    res.json({ message: 'Time entry deleted successfully', deletedEntry: transformTimeEntry(entry) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to transform time entry data
function transformTimeEntry(entry) {
  const startTime = new Date(entry.startTime);
  const endTime = new Date(entry.endTime);
  
  // Calculate hours (decimal format, e.g., 2.5 hours)
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  
  // Get date in YYYY-MM-DD format
  const date = startTime.toISOString().split('T')[0];
  
  return {
    // Include all original fields
    _id: entry._id,
    freelancerId: entry.freelancerId,
    project: entry.project,
    clientName: entry.clientName,
    startTime: entry.startTime,
    endTime: entry.endTime,
    description: entry.description,
    billableRate: entry.billableRate,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    
    // Add computed fields that dashboard expects
    hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
    date: date,
    client: entry.clientName, // Dashboard expects 'client' field
    
    // Additional useful computed fields
    totalAmount: Math.round(hours * entry.billableRate * 100) / 100, // Total earnings for this entry
    duration: `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m` // Human readable duration
  };
}