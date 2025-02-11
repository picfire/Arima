
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // ✅ Define app before using it

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Import routes (Make sure this line is AFTER defining `app`)
const authRoutes = require('./routes/auth.js'); 
console.log('Available routes:', authRoutes.stack);  // Add this line to see registered routes
app.use('/api/auth', authRoutes); // ✅ Works because `app` is now defined

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));