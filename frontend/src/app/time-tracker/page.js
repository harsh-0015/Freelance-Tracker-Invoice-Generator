'use client';
import { useEffect, useState } from 'react';
import { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry, getClients } from '@/utils/api';

export default function TimeTrackerPage() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSession, setCurrentSession] = useState({
    clientName: '',
    project: '',
    billableRate: ''
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    project: '',
    startTime: '',
    endTime: '',
    billableRate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timeData, clientData] = await Promise.all([
        getTimeEntries(),
        getClients()
      ]);
      setTimeEntries(timeData);
      setClients(clientData);
    } catch (err) {
      setError('Failed to fetch data. Make sure your backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (!currentSession.clientName || !currentSession.billableRate) {
      alert('Please select client and enter rate');
      return;
    }
    setIsRunning(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const stopTimer = async () => {
    if (!startTime) return;
    
    try {
      setSubmitting(true);
      const endTime = Date.now();
      
      const timeEntryData = {
        freelancerId: 'default-freelancer',
        clientName: currentSession.clientName,
        project: currentSession.project,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        billableRate: parseFloat(currentSession.billableRate)
      };

      const newEntry = await createTimeEntry(timeEntryData);
      setTimeEntries([newEntry, ...timeEntries]);
      
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
      setCurrentSession({ clientName: '', project: '', billableRate: '' });
    } catch (err) {
      alert('Failed to save time entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.startTime || !formData.endTime || !formData.billableRate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const timeEntryData = {
        freelancerId: 'default-freelancer',
        clientName: formData.clientName,
        project: formData.project,
        startTime: formData.startTime,
        endTime: formData.endTime,
        billableRate: parseFloat(formData.billableRate)
      };

      if (editingEntry) {
        const updatedEntry = await updateTimeEntry(editingEntry._id, timeEntryData);
        setTimeEntries(timeEntries.map(entry => 
          entry._id === editingEntry._id ? updatedEntry : entry
        ));
        setEditingEntry(null);
      } else {
        const newEntry = await createTimeEntry(timeEntryData);
        setTimeEntries([newEntry, ...timeEntries]);
      }
      
      setFormData({ clientName: '', project: '', startTime: '', endTime: '', billableRate: '' });
      setShowForm(false);
    } catch (err) {
      alert(`Failed to ${editingEntry ? 'update' : 'create'} time entry`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      clientName: entry.clientName,
      project: entry.project || '',
      startTime: new Date(entry.startTime).toISOString().slice(0, 16),
      endTime: new Date(entry.endTime).toISOString().slice(0, 16),
      billableRate: entry.billableRate.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await deleteTimeEntry(id);
      setTimeEntries(timeEntries.filter(entry => entry._id !== id));
    } catch (err) {
      alert('Failed to delete time entry');
    }
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-xl text-gray-800">Loading time tracker...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 smooth-scroll-container" style={{scrollBehavior: 'smooth'}}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Time Tracker</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingEntry(null);
            setFormData({ clientName: '', project: '', startTime: '', endTime: '', billableRate: '' });
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-800 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : 'Add Entry'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="font-medium">{error}</span>
          <button onClick={fetchData} className="ml-4 text-sm underline">Retry</button>
        </div>
      )}

      {/* Live Timer */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Live Timer</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Client *</label>
            <select
              value={currentSession.clientName}
              onChange={(e) => setCurrentSession({ ...currentSession, clientName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isRunning}
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client._id} value={client.name}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Project</label>
            <input
              type="text"
              value={currentSession.project}
              onChange={(e) => setCurrentSession({ ...currentSession, project: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isRunning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Rate (₹/hr) *</label>
            <input
              type="number"
              value={currentSession.billableRate}
              onChange={(e) => setCurrentSession({ ...currentSession, billableRate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isRunning}
              min="0"
            />
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-gray-800 mb-4">
            {formatTime(elapsedTime)}
          </div>
          <button
            onClick={isRunning ? stopTimer : startTimer}
            disabled={submitting}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {submitting ? 'Saving...' : isRunning ? 'Stop Timer' : 'Start Timer'}
          </button>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showForm && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingEntry ? 'Edit Entry' : 'Add Manual Entry'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Client *</label>
              <select
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client.name}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Project</label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Start Time *</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">End Time *</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Rate (₹/hr) *</label>
              <input
                type="number"
                value={formData.billableRate}
                onChange={(e) => setFormData({ ...formData, billableRate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
                min="0"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editingEntry ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time Entries List */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Time Entries ({timeEntries.length})</h3>
        </div>
        
        {timeEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <div className="text-lg">No time entries yet. Start your first timer or add an entry.</div>
          </div>
        ) : (
          <div className="overflow-x-auto smooth-scroll-table" style={{scrollBehavior: 'smooth'}}>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-800">Client</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Project</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Duration</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Rate</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Total</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map((entry) => (
                  <tr key={entry._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <td className="p-4 font-semibold text-gray-900">{entry.clientName}</td>
                    <td className="p-4 text-gray-700">{entry.project || 'N/A'}</td>
                    <td className="p-4 font-semibold text-gray-900">{entry.duration}</td>
                    <td className="p-4 text-gray-700">₹{entry.billableRate}</td>
                    <td className="p-4 font-semibold text-green-600">₹{entry.totalAmount.toLocaleString()}</td>
                    <td className="p-4 text-gray-700">{entry.date}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold mr-4 hover:underline transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(entry._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold hover:underline transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}