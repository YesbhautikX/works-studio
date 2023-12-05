const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');  
const { Resend } = require('resend');
require('dotenv').config();
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());  

app.use((req, res, next) => {
  if (req.originalUrl.endsWith('.css')) {
    res.type('.css');
  }
  next();
});

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

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

const resend = new Resend(process.env.RESEND_API_KEY);

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
app.use((req, res) => {
    res.status(404).render('404');
  });
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
