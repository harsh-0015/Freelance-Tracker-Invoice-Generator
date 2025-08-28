export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch top clients (dashboard)
export const getTopClients = async () => {
  const res = await fetch(`${API_URL}/api/invoices/top-clients`);
  if (!res.ok) throw new Error('Failed to fetch top clients');
  return res.json();
};

// Fetch all clients
export const getClients = async () => {
  const res = await fetch(`${API_URL}/api/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
};

// Create a new client
export const createClient = async (clientData) => {
  const res = await fetch(`${API_URL}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
};

// ==================== TIME ENTRY FUNCTIONS ====================

// Fetch all time entries
export const getTimeEntries = async () => {
  const res = await fetch(`${API_URL}/api/time-entries`);
  if (!res.ok) throw new Error('Failed to fetch time entries');
  return res.json();
};

// Get single time entry by ID
export const getTimeEntryById = async (id) => {
  const res = await fetch(`${API_URL}/api/time-entries/${id}`);
  if (!res.ok) throw new Error('Failed to fetch time entry');
  return res.json();
};

// Create a new time entry
export const createTimeEntry = async (timeEntryData) => {
  const res = await fetch(`${API_URL}/api/time-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(timeEntryData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create time entry');
  }
  return res.json();
};

// Update time entry
export const updateTimeEntry = async (id, timeEntryData) => {
  const res = await fetch(`${API_URL}/api/time-entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(timeEntryData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update time entry');
  }
  return res.json();
};

// Delete time entry
export const deleteTimeEntry = async (id) => {
  const res = await fetch(`${API_URL}/api/time-entries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete time entry');
  }
  return res.json();
};