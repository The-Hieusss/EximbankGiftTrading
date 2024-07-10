const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5502;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

let products = [];
let userProductHistory = {};

// Fetch data from external API and store it locally
async function fetchData() {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    products = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Endpoint to get all products
app.get('/products', (req, res) => {
  res.json(products);
});

// Endpoint to get a product by ID
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
});

// Update product data
app.put('/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...req.body };
    res.json(products[productIndex]);
  } else {
    res.status(404).send('Product not found');
  }
});

// Add new product
app.post('/products', (req, res) => {
  const newProduct = { id: products.length + 1, ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Delete product
app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.status(204).send();
});


// Get user product history
app.get('/users/:userId/history', async (req, res) => {
  const userId = req.params.userId;

  // Validate user ID by requesting the user server
  try {
    const userResponse = await axios.get(`http://localhost:5501/users/${userId}`);
    if (userResponse.data) {
      res.json(userProductHistory[userId] || []);
    }
  } catch (error) {
    res.status(404).send('User not found');
  }
});

// Add product to user history
app.post('/users/:userId/history', async (req, res) => {
  const userId = req.params.userId;
  const product = req.body;

  // Validate user ID by requesting the user server
  try {
    const userResponse = await axios.get(`http://localhost:5501/users/${userId}`);
    if (userResponse.data) {
      if (!userProductHistory[userId]) {
        userProductHistory[userId] = [];
      }
      userProductHistory[userId].push(product);
      res.status(201).json(product);
    }
  } catch (error) {
    res.status(404).send('User not found');
  }
});



// Fetch data when server starts
fetchData();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
