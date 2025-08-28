"use client";
import { useEffect, useState } from "react";

export default function TimeEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    freelancerId: "",
    project: "",
    startTime: "",
    endTime: "",
    description: "",
    billableRate: "",
  });

  // Fetch all time entries
  useEffect(() => {
    fetch("http://localhost:5000/api/time-entries")
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert form data to proper format
      const entryData = {
        ...newEntry,
        startTime: new Date(newEntry.startTime).toISOString(),
        endTime: new Date(newEntry.endTime).toISOString(),
        billableRate: parseFloat(newEntry.billableRate)
      };

      const res = await fetch("http://localhost:5000/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add entry");
      }

      const created = await res.json();
      setEntries([...entries, created]);
      setNewEntry({ 
        freelancerId: "",
        project: "",
        startTime: "",
        endTime: "",
        description: "",
        billableRate: "",
      });
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error adding entry: " + error.message);
    }
  };

  // Calculate hours worked
  const calculateHours = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-lg mb-6">
          <h1 className="text-2xl font-bold">Time Entries</h1>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="freelancerId"
              value={newEntry.freelancerId}
              onChange={handleChange}
              placeholder="Freelancer ID"
              className="border border-gray-300 p-3 w-full rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="project"
              value={newEntry.project}
              onChange={handleChange}
              placeholder="Project Name"
              className="border border-gray-300 p-3 w-full rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={newEntry.startTime}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 w-full rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={newEntry.endTime}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 w-full rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <input
              type="number"
              name="billableRate"
              value={newEntry.billableRate}
              onChange={handleChange}
              placeholder="Billable Rate ($/hour)"
              step="0.01"
              className="border border-gray-300 p-3 w-full rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              name="description"
              value={newEntry.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              rows="3"
              className="border border-gray-300 p-3 w-full rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Add Entry
            </button>
          </form>
        </div>

        {/* Entries List Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Entries</h2>
          {entries.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No entries found. Add your first time entry above!</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry._id || index}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {entry.project || 'No Project'}
                        </span>
                        <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                          {entry.freelancerId}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>Hours:</strong> {calculateHours(entry.startTime, entry.endTime)}h
                        </div>
                        <div>
                          <strong>Rate:</strong> ${entry.billableRate}/hour
                        </div>
                        <div>
                          <strong>Total:</strong> ${(calculateHours(entry.startTime, entry.endTime) * entry.billableRate).toFixed(2)}
                        </div>
                        {entry.description && (
                          <div>
                            <strong>Description:</strong> {entry.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>{new Date(entry.startTime).toLocaleDateString()}</div>
                      <div>
                        {new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(entry.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}