# Works Studio

This is an open-source template for showcasing works, designed for agencies and individuals. It combines professional looks with simplicity and will be maintained and updated over time. Anyone can use this template.

## Project Overview

- **Name**: Works Studio
- **Version**: 1.2.0
- **Description**: Open-source template for showcasing works, designed for agencies and individuals.
- **License**: [MIT](https://github.com/YesbhautikX/works-studio/blob/main/LICENSE)

## Features

- Professional and simple design
- Responsive layout
- Multiple project showcases
- Integration with various tools and APIs
- Customizable and easy to maintain

## Installation

1. Clone the repository:
```sh
git clone https://github.com/YesbhautikX/works-studio.git
```

2. Navigate to the project directory:
```sh
cd works-studio
```

3. Install dependencies:
```sh
npm install
```

4. Build the application:
```sh
npm run build
```

5. Start the server:
```sh
npm start
```

## Project Structure

- **public/**: Contains static files like CSS, JS, and images.
- **views/**: Contains EJS templates for rendering HTML.
- **data/**: Contains project data in JSON format.
- **app.js**: Main application file.

## Dependencies

- axios: ^1.6.8
- cheerio: ^1.0.0-rc.12
- chokidar: ^3.6.0
- cloudinary: ^2.0.3
- dotenv: ^16.3.1
- ejs: ^3.1.9
- express: ^4.19.2
- redis: ^4.6.11
- resend: ^2.0.0
- sitemap: ^7.1.1

## Usage

### Adding a New Project

1. Add project details in `data/projectsData.js`:

```javascript:data/projectsData.js
const projects = [
{
id: "new_project_id",
name: "New Project",
images: ["/images/new_project_1.png", "/images/new_project_2.png"],
year: "2024",
client: "Client Name",
services: ["Service1", "Service2"],
projectLink: "https://example.com",
concept: "Project concept description",
plan: "Project plan details"
},
// other projects...
];
```

2. Add project images in the `public/images` directory.

### Customizing Styles

Modify the CSS files in the `public/css` directory to customize the look and feel of the website.

### Updating Content

Update the EJS templates in the `views` directory to change the content and structure of the web pages.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/YesbhautikX/works-studio/blob/main/LICENSE) file for details.

## Acknowledgements

Thanks to all contributors and users of this template.

**Special Thanks to:**
- [Yashvi Shah](<https://www.linkedin.com/in/yashvidotdev/>)
- Other [YesbhautikX Team Members](<https://www.linkedin.com/company/yesbhautikx>)

---

For more information, refer to the codebase.
