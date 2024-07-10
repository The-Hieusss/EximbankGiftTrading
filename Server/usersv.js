const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5501;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


let users = [];

// Fetch data from external API and store it locally
async function fetchData() {
  try {
    const response = await axios.get('https://fakestoreapi.com/users');
    users = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// User login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ message: 'Login successful', token: 'dummy-token', user: { id: user.id } }); // Include user ID in the response
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});




// Endpoint to get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Endpoint to get a user by ID
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).send('User not found');
  }
});

// Update user data
app.put('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
  } else {
    res.status(404).send('User not found');
  }
});

// Add new user
app.post('/users', (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Delete user
app.delete('/users/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Fetch data when server starts
fetchData();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
