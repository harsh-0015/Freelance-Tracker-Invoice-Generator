'use client';

import { useEffect, useState } from 'react';
import InvoicePDFGenerator from '@/components/InvoicePDFGenerator';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    freelancerId: '',
    freelancerName: '',
    clientName: '',
    project: '',
    totalHours: '',
    totalAmount: '',
    ratePerHour: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      } else {
        console.error('Failed to fetch invoices');
      }
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Prepare the data - convert numbers to proper format
      const invoiceData = {
        freelancerId: form.freelancerId.trim(),
        freelancerName: form.freelancerName.trim(),
        clientName: form.clientName.trim(),
        project: form.project.trim(),
        totalHours: parseFloat(form.totalHours),
        totalAmount: parseFloat(form.totalAmount),
        ratePerHour: parseFloat(form.ratePerHour),
      };

      console.log('Sending invoice data:', invoiceData); // Debug log

      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (res.ok) {
        const newInvoice = await res.json();
        console.log('Invoice created successfully:', newInvoice);
        setForm({ 
          freelancerId: '',
          freelancerName: '',
          clientName: '', 
          project: '',
          totalHours: '', 
          totalAmount: '',
          ratePerHour: ''
        });
        await fetchInvoices(); // Refresh list
        setActiveTab('list'); // Switch to list view
      } else {
        // Get the error message from the response
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to create invoice:', errorData);
        setError(errorData.message || `Server error: ${res.status}`);
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => 
    inv.freelancerName &&
    inv.clientName &&
    inv.project &&
    inv.totalAmount &&
    inv.totalHours &&
    inv.ratePerHour
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              {/* Logo */}
              <div className="mr-4">
                <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg">
                  {/* Document background */}
                  <rect x="20" y="15" width="50" height="65" rx="4" ry="4" fill="url(#docGradient)" stroke="#2563eb" strokeWidth="2"/>
                  {/* Document corner fold */}
                  <path d="M60 15 L70 25 L60 25 Z" fill="#1d4ed8"/>
                  {/* Document lines */}
                  <rect x="28" y="28" width="24" height="3" rx="1.5" fill="#059669"/>
                  <rect x="28" y="36" width="20" height="2.5" rx="1.25" fill="#059669"/>
                  <rect x="28" y="44" width="16" height="2.5" rx="1.25" fill="#059669"/>
                  {/* Clock circle */}
                  <circle cx="65" cy="65" r="18" fill="#10b981" stroke="#ffffff" strokeWidth="3"/>
                  {/* Clock hands */}
                  <line x1="65" y1="65" x2="65" y2="53" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="65" y1="65" x2="72" y2="65" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="65" cy="65" r="2" fill="#ffffff"/>
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa"/>
                      <stop offset="100%" stopColor="#3b82f6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
                <p className="text-gray-600 mt-1">Create and manage your invoices efficiently</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'create'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Create Invoice
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'list'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                View Invoices ({filteredInvoices.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? (
          /* Create Invoice Section */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Create New Invoice</h2>
                <p className="text-blue-100 mt-1">Fill in the details to generate a professional invoice</p>
              </div>
              
              <div className="p-8">
                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Freelancer ID *
                      </label>
                      <input
                        type="text"
                        name="freelancerId"
                        placeholder="Enter freelancer ID"
                        value={form.freelancerId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Freelancer Name
                      </label>
                      <input
                        type="text"
                        name="freelancerName"
                        placeholder="Enter freelancer name"
                        value={form.freelancerName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg  focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Client Name
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        placeholder="Enter client name"
                        value={form.clientName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        name="project"
                        placeholder="Enter project name"
                        value={form.project}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg  focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Hours *
                      </label>
                      <input
                        type="number"
                        name="totalHours"
                        placeholder="0.00"
                        value={form.totalHours}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg  focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rate Per Hour
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="ratePerHour"
                          placeholder="0.00"
                          value={form.ratePerHour}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg  focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Amount *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="totalAmount"
                          placeholder="0.00"
                          value={form.totalAmount}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg  focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Invoice...
                        </div>
                      ) : (
                        'Create Invoice'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Invoice List Section */
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Invoice History</h2>
                    <p className="text-indigo-100 mt-1">
                      {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <span className="text-white font-semibold text-lg">{filteredInvoices.length}</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-900 mt-4">No invoices yet</h3>
                    <p className="text-gray-500 mt-2">Get started by creating your first invoice</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Create Invoice
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredInvoices.map((inv) => (
                      <div key={inv._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">{inv.freelancerName || inv.freelancerId}</h3>
                              <p className="text-gray-600 text-sm">{inv.clientName}</p>
                            </div>
                            <div className="text-right">
                              <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                ₹{inv.totalAmount}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Project:</span>
                              <span className="text-sm font-medium text-gray-900">{inv.project}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Hours:</span>
                              <span className="text-sm font-medium text-gray-900">{inv.totalHours}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Rate:</span>
                              <span className="text-sm font-medium text-gray-900">₹{inv.ratePerHour}/hr</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm text-gray-600">Generated:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(inv.generatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <InvoicePDFGenerator invoice={inv} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
