'use client';
import { useEffect, useState } from 'react';
import { getClients, createClient } from '@/utils/api';



export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClients();
      setClients(data);
    } catch (err) {
      setError('Failed to fetch clients. Make sure your backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    
    if (!newClient.name.trim() || !newClient.email.trim()) {
      alert('Name and email are required');
      return;
    }

    try {
      setSubmitting(true);
      const addedClient = await createClient(newClient);
      setClients([addedClient, ...clients]);
      setNewClient({ name: '', email: '', phone: '', company: '', address: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to add client. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-xl text-gray-800">Loading clients...</div>
          <div className="text-gray-600 mt-2">Fetching from server</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Clients</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-800 transition-colors font-medium"
        >
          {showAddForm ? 'Cancel' : 'Add Client'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <span className="font-medium">{error}</span>
          <button 
            onClick={fetchClients}
            className="ml-4 text-sm underline hover:no-underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Add Client Form */}
      {showAddForm && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Client</h3>
          <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name *</label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Company</label>
              <input
                type="text"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                disabled={submitting}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Address</label>
              <textarea
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows="3"
                disabled={submitting}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients List */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">All Clients ({clients.length})</h3>
        </div>
        {clients.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <div className="text-lg">
              {error ? 'Unable to load clients' : 'No clients found. Add your first client to get started.'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-800">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Phone</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Company</th>
                  <th className="text-left p-4 font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className="border-b border-gray-200 hover:bg-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <td className="p-4 font-semibold text-gray-900">{client.name}</td>
                    <td className="p-4 text-gray-700">{client.email}</td>
                    <td className="p-4 text-gray-700">{client.phone || 'N/A'}</td>
                    <td className="p-4 text-gray-700">{client.company || 'N/A'}</td>
                    <td className="p-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold mr-4 hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-semibold hover:underline">
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