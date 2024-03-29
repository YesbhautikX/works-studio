require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Resend } = require('resend');
const projectsData = require('./data/projectsData'); 
const chokidar = require('chokidar');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const app = express();
const port = 3000;
const { setupWatcher, uploadExistingImages, imageExistenceCache } = require('./cloudinaryManager');
const cloudinaryMiddleware = require('./cloudinaryMiddleware');


// Set view engine and views path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Call this function when the server starts
setupWatcher();
uploadExistingImages('public/images'); 

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


// Webhook endpoint to handle deletion notifications from Cloudinary
app.post('/cloudinary-webhook', bodyParser.json(), (req, res) => {
  const { public_id } = req.body;
  // Invalidate the local cache for the deleted image
  imageExistenceCache[public_id] = false;
  res.status(204).send();
});

app.use(cloudinaryMiddleware);

// Routes
app.get('/', (req, res) => {
  res.render('home', { projects: projectsData });
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

app.get('/api/projects', (req, res) => {
  try {
      const { category, subcategory, offset = 0, limit = 2 } = req.query;
      let filteredProjects = projectsData; // Corrected variable name

      if (category && category !== 'All') {
          filteredProjects = filteredProjects.filter(project => project.category === category);
      }

      if (subcategory) {
          filteredProjects = filteredProjects.filter(project => project.subcategory === subcategory);
      }

      const paginatedProjects = filteredProjects.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      res.json({
          projects: paginatedProjects,
          hasMore: parseInt(offset) + parseInt(limit) < filteredProjects.length
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const project = projectsData.find(p => p.id === projectId);

  if (project) {
    res.render('project', { project: project });
  } else {
    res.status(404).render('404'); 
  }
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
