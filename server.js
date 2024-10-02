const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const xml2js = require('xml2js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors({
  origin: process.env.VERCEL ? 'https://dataviewssfmc.vercel.app' : 'http://localhost:3000',
  credentials: true
}));

// Add this near the top of your routes
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/dataViews', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dataViews.html'));
});

// Handle login
app.post('/login', async (req, res) => {
  const { clientId, clientSecret, subdomain } = req.body;

  console.log('Login attempt received:', { subdomain, clientId: clientId.slice(0, 5) + '...' });

  if (!clientId || !clientSecret || !subdomain) {
    console.error('Missing required fields for login');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log(`Attempting login for subdomain: ${subdomain}`);
    const response = await axios.post(`https://${subdomain}.auth.marketingcloudapis.com/v2/token`, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    const accessToken = response.data.access_token;
    console.log('Access token generated successfully');
    res.json({ accessToken });
  } catch (error) {
    console.error('Authentication failed:', error.response ? JSON.stringify(error.response.data) : error.message);
    res.status(400).json({ 
      error: 'Authentication failed', 
      details: error.response ? error.response.data : error.message,
      stack: error.stack
    });
  }
});

// Handle bounce request
app.post('/bounceRequest', async (req, res) => {
  const { subdomain, accessToken, soapEnvelope } = req.body;

  try {
    const response = await axios.post(
      `https://${subdomain}.soap.marketingcloudapis.com/Service.asmx`,
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'Retrieve'
        }
      }
    );

    console.log('SOAP response:', response.data);

    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(response.data);

    // Check if there is a SOAP fault
    if (parsedData['soap:Envelope']['soap:Body']['soap:Fault']) {
      const fault = parsedData['soap:Envelope']['soap:Body']['soap:Fault'];
      console.error('SOAP Fault:', fault);
      res.status(400).json({ error: `SOAP Fault: ${fault.faultstring}` });
    } else {
      res.json(parsedData);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch bounce data', details: error.message });
  }
});

// Handle Open data view request
app.post('/openRequest', async (req, res) => {
    const { subdomain, accessToken, soapEnvelope } = req.body;
  
    try {
      const response = await axios.post(
        `https://${subdomain}.soap.marketingcloudapis.com/Service.asmx`,
        soapEnvelope,
        {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'Retrieve'
          }
        }
      );
  
      console.log('SOAP response:', response.data);
  
      const parser = new xml2js.Parser({ explicitArray: false });
      const parsedData = await parser.parseStringPromise(response.data);
  
      // Check if there is a SOAP fault
      if (parsedData['soap:Envelope']['soap:Body']['soap:Fault']) {
        const fault = parsedData['soap:Envelope']['soap:Body']['soap:Fault'];
        console.error('SOAP Fault:', fault);
        res.status(400).json({ error: `SOAP Fault: ${fault.faultstring}` });
      } else {
        res.json(parsedData);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to fetch bounce data', details: error.message });
    }
  });

// Add a catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Add a catch-all route at the end
app.use('*', (req, res) => {
  console.log(`Catch-all route hit for ${req.url}`);
  res.status(404).json({ error: 'Not Found' });
});

// If you're using Vercel, you might need to export the app differently
if (process.env.VERCEL) {
  console.log('Running in Vercel environment');
  module.exports = app;
} else {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}