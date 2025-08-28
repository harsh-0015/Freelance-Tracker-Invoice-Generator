'use client';
import { useEffect, useState } from "react";
import { getTopClients, API_URL } from '@/utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayHours: 0,
    weekHours: 0,
    pendingInvoices: 0,
    activeClients: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Fetch time entries - using your backend URL
      const timeRes = await fetch(`${API_URL}/api/time-entries`);
      if (!timeRes.ok) throw new Error('Failed to fetch time entries');
      const timeEntries = await timeRes.json();

      // Calculate today's hours
      const today = new Date().toISOString().split("T")[0];
      const todayHours = timeEntries
        .filter((entry) => entry.date === today)
        .reduce((sum, entry) => sum + (entry.hours || 0), 0);

      // Calculate week hours (Mon-Sun)
       const now = new Date();
       const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
       const firstDayOfWeek = new Date(now);
       firstDayOfWeek.setDate(now.getDate() - currentDay + 1); // Start from Monday

const weekHours = timeEntries
  .filter((entry) => new Date(entry.date) >= firstDayOfWeek)
  .reduce((sum, entry) => sum + (entry.hours || 0), 0);

      // 2️⃣ Fetch invoices - using your backend URL
      const invoiceRes = await fetch(`${API_URL}/api/invoices`);
      if (!invoiceRes.ok) throw new Error('Failed to fetch invoices');
      const invoices = await invoiceRes.json();

      const pendingInvoices = invoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);

      // 3️⃣ Fetch clients - using your backend URL
      const clientRes = await fetch(`${API_URL}/api/clients`);
      if (!clientRes.ok) throw new Error('Failed to fetch clients');
      const clients = await clientRes.json();
      const activeClients = clients.length;

      // 4️⃣ Recent Activity (last 5 events)
      const recent = [
        ...timeEntries.map((e) => ({
          type: "Time Entry",
          detail: `${e.hours || 0} hrs for ${e.client || 'Unknown Client'}`,
          date: e.date,
          timestamp: new Date(e.date).getTime()
        })),
        ...invoices.map((i) => ({
          type: "Invoice",
          detail: `₹${i.amount || 0} for ${i.client || 'Unknown Client'} (${i.status})`,
          date: i.date,
          timestamp: new Date(i.date).getTime()
        })),
      ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

      // Set state
      setStats({
        todayHours,
        weekHours,
        pendingInvoices,
        activeClients,
      });
      setRecentActivity(recent);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top clients using your existing function
  useEffect(() => {
    async function fetchTopClients() {
      try {
        const data = await getTopClients();
        setTopClients(data);
      } catch (err) {
        console.error("Error fetching top clients:", err);
        // Don't set error here, just log it - top clients is optional
      }
    }
    fetchTopClients();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-xl text-gray-800">Loading dashboard...</div>
          {/* <div className="text-gray-600 mt-2">Connecting to {API_URL}</div> */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <div className="text-xl">{error}</div>
          <div className="text-sm mt-2">Make sure your backend server is running on {API_URL}</div>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Section */}
      {/* <h2 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Today's Hours" value={`${stats.todayHours} hrs`} />
        <StatCard title="This Week" value={`${stats.weekHours} hrs`} />
        <StatCard title="Pending Invoices" value={`₹${stats.pendingInvoices.toLocaleString()}`} />
        <StatCard title="Active Clients" value={stats.activeClients} />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3 text-white">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-600 border rounded bg-gray-50">
            No recent activity found
          </div>
        ) : (
          <ul className="space-y-2">
            {recentActivity.map((act, idx) => (
              <li key={idx} className="border border-gray-200 p-4 rounded bg-white shadow-sm hover:bg-gray-300 transition-colors">
                <span className="font-semibold text-blue-700">{act.type}:</span>{" "}
                <span className="text-gray-800">{act.detail}</span>{" "}
                <span className="text-gray-600 text-sm">— {act.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Top Clients by Invoices */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3 text-white">Top Clients</h3>
        {topClients.length === 0 ? (
          <div className="text-center py-8 text-gray-600 border rounded bg-gray-50">
            No top clients data available
            {/* <div className="text-xs mt-1 text-gray-500">Check if /api/invoices/top-clients endpoint exists</div> */}
          </div>
        ) : (
          <ul className="space-y-2">
            {topClients.map((client, idx) => (
              <li key={client._id || idx} className="border border-gray-200 p-4 rounded flex justify-between bg-white shadow-sm hover:bg-gray-300 transition-colors">
                <span className="font-medium text-gray-800">{client.name}</span>
                <span className="font-semibold text-green-600">{client.totalInvoices} invoices</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Simple Stat Card component
function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100 transition-colors">
      <h4 className="text-gray-600 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}