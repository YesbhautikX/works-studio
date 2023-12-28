require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Resend } = require('resend');

const app = express();
const port = 3000;

// Set view engine and views path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON
app.use(bodyParser.json());

// Middleware for handling CSS files
app.use((req, res, next) => {
  if (req.originalUrl.endsWith('.css')) {
    res.type('.css');
  }
  next();
});

// Static file serving
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/404', (req, res) => {
  res.render('404');
});

app.get('/projects/magic-app', (req, res) => {
  res.render('projects/magic-app');
});

app.get('/projects/unbuilt', (req, res) => {
  res.render('projects/unbuilt');
});

// Create Resend instance using environment variable
const resend = new Resend(process.env.RESEND_API);

// Route for sending emails
app.post('/send-email', async (req, res) => {
  const { from, to, subject, html } = req.body;

  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html });

    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // console.log('Email sent successfully:', data);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 Route
app.use((req, res) => {
  res.status(404).render('404');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
