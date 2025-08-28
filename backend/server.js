// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const timeEntryRoutes = require('./routes/timeEntryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const clientRoutes = require('./routes/clientRoutes');

app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);


// Connect to MongoDB with Mongoose (better SSL handling)
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options help with SSL issues
      ssl: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
    // Don't exit process in development
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
}

connectDB();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test database connection route
app.get('/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (dbState === 1) {
      // Test a simple database operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      res.json({
        status: 'success',
        message: 'Database connection successful',
        state: states[dbState],
        database: mongoose.connection.name,
        collections: collections.map(col => col.name)
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Database not connected',
        state: states[dbState]
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection test failed',
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔗 Test database connection at: http://localhost:${PORT}/test-db`);
});

module.exports = app;