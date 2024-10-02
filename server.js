const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const xml2js = require('xml2js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

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

  try {
    const response = await axios.post(`https://${subdomain}.auth.marketingcloudapis.com/v2/token`, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    const accessToken = response.data.access_token;
    res.json({ accessToken });
  } catch (error) {
    res.status(400).json({ error: 'Authentication failed' });
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
  


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// At the end of your server.js file, add:
module.exports = app;