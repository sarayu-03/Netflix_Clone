const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/UserRoutes");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Basic route to test server
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Test route to add a sample user
app.get('/test-db', async (req, res) => {
  try {
    const User = require("./models/UserModel");
    const testUser = new User({
      email: "test@example.com",
      likedMovies: []
    });
    await testUser.save();
    res.json({ message: 'Test user added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://22bcs114:2005114@cluster0.yxfsc.mongodb.net/netflixclone")
  .then(() => {
    console.log("DB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Test MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Routes
app.use("/api/user", userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});