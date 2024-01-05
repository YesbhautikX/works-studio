require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

require("./utils/database");
const Work = require("./models/works");

const app = express();
const port = 3000;

// Set view engine and views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing JSON
app.use(bodyParser.json());

// Middleware for handling CSS files
app.use((req, res, next) => {
  if (req.originalUrl.endsWith(".css")) {
    res.type(".css");
  }
  next();
});

// Static file serving
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let itemsPerPage = 4;
    let limit = itemsPerPage;
    let skip = (page - 1) * limit;
    const totalItems = await Work.find().countDocuments();
    const works = await Work.find().skip(skip).limit(limit);
    res.render("home", {
      data: works,
      currentPage: page,
      hasNextPage: itemsPerPage * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / itemsPerPage),
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/404", (req, res) => {
  res.render("404");
});

app.get("/projects/:name", async (req, res) => {
  try {
    const proName = req.params.name;
    const works = await Work.findOne({ name: proName });
    const cats = works.categories;
    const relatedWorks = await Work.find({
      categories: { $in: [cats[0], cats[1]] },
    }).limit(2);
    if (works) {
      res.render(`projects/unbuilt`, {
        data: works,
        items: relatedWorks,
      });
    } else {
      res.render("404");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Creating and Retrieving Works to and from Database
app.post("/createWork", upload.single("image"), async (req, res) => {
  try {
    const number = req.body.number;
    const name = req.body.name;
    const categories = req.body.categories;
    const subcategories = req.body.subcategories;
    const year = req.body.year;
    const description = req.body.description;
    const link = req.body.link;
    const image = { data: req.file.buffer, contentType: req.file.mimetype };

    const isWork = await Work.findOne({ name });

    if (isWork) {
      res.send("Work already exists.");
    } else {
      const newWork = new Work({
        number,
        name,
        categories,
        subcategories,
        year,
        description,
        link,
        image,
      });

      const workData = newWork.save();

      res.status(201).send("Work Created.");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// Create Resend instance using environment variable
const resend = new Resend(process.env.RESEND_API);

// Route for sending emails
app.post("/send-email", async (req, res) => {
  const { from, to, subject, html } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // console.log('Email sent successfully:', data);
      res.json({ success: true });
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// 404 Route
app.use((req, res) => {
  res.status(404).render("404");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
