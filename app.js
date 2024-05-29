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
const serverless = require('serverless-http');

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

function dynamicTitle(req, res, next) {
  // Set a default title for the home page
  let title = "Works Studio"; // Default title for the home page

  if (req.path !== "/") {
      // Extract the file name from the path and capitalize the first letter
      let fileName = req.path.split('/').pop(); // Get the last segment of the path
      title = fileName.charAt(0).toUpperCase() + fileName.slice(1); // Capitalize the first letter
  }

  title += " - YesbhautikX";

  res.locals.title = title;

  
  next();
}

// Apply the middleware to all routes
app.use(dynamicTitle);

// Routes
app.get('/', (req, res) => {
  res.render('home', { projects: projectsData });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact', { siteKey: process.env.CLOUDFLARE_TURNSTILE_KEY });
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
    // Set the title before rendering the response
    res.locals.title = `${project.name} - YesbhautikX`;
    res.render('project', { project: project });
  } else {
    // You might want to set a different title for the 404 page
    res.locals.title = `Project Not Found - YesbhautikX`;
    res.status(404).render('404');
  }
});

app.post('/submit-form', async (req, res) => {
  const token = req.body['cf-turnstile-response'];
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET; // Use the secret key from .env

  try {
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', null, {
      params: {
        secret: secretKey,
        response: token,
      },
    });

    const verificationResult = response.data;

    if (verificationResult.success) {
      // CAPTCHA was successfully solved
      // Proceed with form submission handling
      res.send('CAPTCHA verified successfully!');
    } else {
      // CAPTCHA verification failed
      res.status(400).send('CAPTCHA verification failed.');
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    res.status(500).send('Server error during CAPTCHA verification.');
  }
});

// Create Resend instance using environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

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

const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

app.get('/sitemap.xml', async (req, res) => {
  const staticUrls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.8 },
  ];

  // Generate dynamic URLs from your projectsData
  const dynamicUrls = projectsData.map(project => ({
    url: `/projects/${project.id}`, changefreq: 'weekly', priority: 0.7
  }));

  const allUrls = [...staticUrls, ...dynamicUrls];

  try {
    const sitemapStream = new SitemapStream({ hostname: 'https://works.yesbhautikx.co.in', xmlns: {
      image: true,
      video: true,

    }});
    const xmlStream = new Readable({
      read() {
        allUrls.forEach(url => sitemapStream.write(url));
        sitemapStream.end();
      }
    });

    // Collect the sitemap xml content and send it in the response
    streamToPromise(xmlStream.pipe(sitemapStream)).then(data => {
      res.header('Content-Type', 'application/xml');
      res.send(data.toString());
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
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
module.exports.handler = serverless(app);
