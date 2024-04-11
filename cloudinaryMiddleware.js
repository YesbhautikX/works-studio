// const cheerio = require('cheerio');
// const axios = require('axios');
// const cloudinary = require('cloudinary').v2;
// const { imageExistenceCache } = require('./cloudinaryManager');

// module.exports = async (req, res, next) => {
//   let send = res.send;
//   res.send = async function (body) {
//     res.send = send; // Prevent recursion
//     if (typeof body === 'string' && body.includes('</html>')) {
//       const $ = cheerio.load(body);
//       let imageChecks = [];

//       $('img').each(function () {
//         const img = $(this);
//         let src = img.attr('src');

//         // Adjust the src to handle both '/images/' and 'images/' paths
//         if (src && (src.startsWith('/images/') || src.startsWith('images/'))) {
//           if (src.startsWith('images/')) {
//             src = '/' + src; // Prepend a slash if missing
//           }
//           const imageName = src.replace('/images/', '');
//           const publicId = `${process.env.CLOUDINARY_FOLDER}/${imageName}`;

//           // Push the Cloudinary existence check promise to the array
//           const checkPromise = (async () => {
//             // Check local cache first
//             if (imageExistenceCache.hasOwnProperty(publicId) && imageExistenceCache[publicId] === false) {
//               // Image does not exist on Cloudinary, serve local image
//               // console.log(`Serving local image: ${src}`);
//             } else {
//               // Image existence unknown or exists on Cloudinary, check or generate Cloudinary URL
//               const cloudinaryURL = cloudinary.url(publicId, {
//                 secure: true,
//                 transformation: [
//                   { fetch_format: "auto", quality: "auto" } // Example transformation
//                 ]
//               });

//               try {
//                 await axios.head(cloudinaryURL);
//                 // console.log(`Image found in Cloudinary: ${cloudinaryURL}`);
//                 img.attr('src', cloudinaryURL);
//                 imageExistenceCache[publicId] = true; // Update local cache
//               } catch {
//                 // console.log(`Image not found in Cloudinary, using local: ${src}`);
//                 imageExistenceCache[publicId] = false; // Update local cache
//               }
//             }
//           })();

//           imageChecks.push(checkPromise);
//         }
//       });

//       // Wait for all Cloudinary checks to complete
//       await Promise.all(imageChecks);

//       // Send the modified HTML
//       return send.call(this, $.html());
//     } else {
//       // Non-HTML response, send it as-is
//       return send.call(this, body);
 
//     }
//   };
//   next();
// };


const cheerio = require('cheerio');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { imageExistenceCache } = require('./cloudinaryManager');


module.exports = async (req, res, next) => {
  let send = res.send;
  res.send = function (body) {
    if (typeof body === 'string' && body.includes('</html>')) {
      const $ = cheerio.load(body);
      let imageChecks = [];

      $('img').each(function () {
        const img = $(this);
        let src = img.attr('src');

        if (src && (src.startsWith('/images/') || src.startsWith('images/'))) {
          if (src.startsWith('images/')) {
            src = '/' + src;
          }
          const imageName = src.replace('/images/', '');
          const publicId = `${process.env.CLOUDINARY_FOLDER}/${imageName}`;

          const checkPromise = (async () => {
            if (imageExistenceCache.hasOwnProperty(publicId) && imageExistenceCache[publicId] === false) {
              console.log(`Serving local image: ${src}`);
            } else {
              const mainImage = cloudinary.url(publicId, {
                secure: true,                transformation: [
                ]
              })  ;
              const vectorizedPlaceholder = cloudinary.url(publicId, {
                secure: true,
                transformation: [
                  { effect: "vectorize:3:0.1", fetch_format: "auto", quality: "auto" } // Example vectorize transformation with 3 colors and 0.1 detail level
                ]
              });
          
              try {
                await axios.head(mainImage); // Check if the main image exists
                console.log(`Image found in Cloudinary: ${mainImage}`);
                img.attr('src', vectorizedPlaceholder); // Set vectorized image as the initial src
                img.attr('data-src', mainImage); // Set main image as the data-src for lazy loading
                imageExistenceCache[publicId] = true;
              } catch (error) {
                console.error(`Error fetching image from Cloudinary: ${error}`);
                console.log(`Image not found in Cloudinary, using local: ${src}`);
                imageExistenceCache[publicId] = false;
              }
            }
          })();

          imageChecks.push(checkPromise);
        }
      });

      Promise.all(imageChecks).then(() => {
        send.call(res, $.html());
      });
    } else {
      send.call(res, body);
    }
  };
  next();
};