const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Create views directory if it doesn't exist
const viewsDir = path.join(__dirname, 'views');
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir, { recursive: true });
  console.log('Created views directory');
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created public directory');
}

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', viewsDir);

// Serve static files
app.use(express.static(publicDir));
app.use(express.json());

// Replace with your actual API key
const API_KEY = 'rr_live_N9W_-4m7htMPq8lsdDGuA-37MWjFnyWg';
const API_URL = 'https://railradar.in/api/v1/trains/live-map';

// Route to render the home page
app.get('/', (req, res) => {
  res.render('index');
});

// Route to render the live map page
app.get('/map', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (response.data.success) {
      res.render('map', { 
        trains: response.data.data,
        error: null 
      });
    } else {
      res.render('map', { 
        trains: [], 
        error: response.data.error?.message || 'Failed to fetch train data' 
      });
    }
  } catch (error) {
    console.error('Error fetching train data:', error.message);
    res.render('map', { 
      trains: [], 
      error: 'Unable to connect to train API. Please check your API key and network connection.' 
    });
  }
});

// Route to render train analysis page
app.get('/analysis', (req, res) => {
  res.render('analysis', { trainData: null, error: null });
});

// Route to get specific train analysis
app.get('/analysis/:trainNumber', async (req, res) => {
  const { trainNumber } = req.params;
  const journeyDate = req.query.date || new Date().toISOString().split('T')[0];
  
  try {
    const response = await axios.get(`https://railradar.in/api/v1/trains/${trainNumber}`, {
      headers: {
        'x-api-key': API_KEY
      },
      params: {
        journeyDate,
        dataType: 'full',
        provider: 'railradar'
      }
    });

    if (response.data.success) {
      res.render('analysis', { 
        trainData: response.data.data,
        error: null,
        searchedTrain: trainNumber,
        searchedDate: journeyDate
      });
    } else {
      res.render('analysis', { 
        trainData: null, 
        error: response.data.error?.message || 'Failed to fetch train analysis data',
        searchedTrain: trainNumber,
        searchedDate: journeyDate
      });
    }
  } catch (error) {
    console.error('Error fetching train analysis:', error.message);
    res.render('analysis', { 
      trainData: null, 
      error: 'Unable to fetch train data. Please check train number and try again.',
      searchedTrain: trainNumber,
      searchedDate: journeyDate
    });
  }
});

// API endpoint to get specific train analysis
app.get('/api/trains/:trainNumber', async (req, res) => {
  const { trainNumber } = req.params;
  const journeyDate = req.query.date || new Date().toISOString().split('T')[0];
  
  try {
    const response = await axios.get(`https://railradar.in/api/v1/trains/${trainNumber}`, {
      headers: {
        'x-api-key': API_KEY
      },
      params: {
        journeyDate,
        dataType: 'full',
        provider: 'railradar'
      }
    });

    if (response.data.success) {
      res.json({
        success: true,
        data: response.data.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.data.error?.message || 'Failed to fetch train analysis'
      });
    }
  } catch (error) {
    console.error('Error fetching train analysis:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to connect to train API'
    });
  }
});

// API endpoint to get fresh train data
app.get('/api/trains', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (response.data.success) {
      res.json({
        success: true,
        trains: response.data.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.data.error?.message || 'Failed to fetch train data'
      });
    }
  } catch (error) {
    console.error('Error fetching train data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to connect to train API'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to replace YOUR_SECRET_TOKEN with your actual API key!');
});