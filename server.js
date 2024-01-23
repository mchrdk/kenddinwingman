const express = require('express');
const app = express();
const port = 8080;
const axios = require('axios');
const cheerio = require('cheerio');
const data = require('./data.json'); // Your JSON data file

// Serve static files from 'public' directory
app.use(express.static('public'));

const cacheDuration = 3600000; // 1 hour in milliseconds
let contactCache = null;
let lastFetchTime = 0;

// Root route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.htm');
});

async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Error fetching the URL: ${url}`, error);
    return null;
  }
}

async function parseContacts(url) {
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const contacts = [];

  $('.contacts .contact-card').each((i, element) => {
      const name = $(element).find('.info .name').text().trim();
      const title = $(element).find('.info .title').text().trim();
      const unit = $(element).find('.info .unit').text().trim();

      let imageUrl = $(element).find('.photo img').attr('src');
      if (imageUrl && !imageUrl.includes('billede_paa_vej.jpg')) {
          // Remove parameters after '.png' and '.jpg'
          const pngIndex = imageUrl.indexOf('.png');
          const jpgIndex = imageUrl.indexOf('.jpg');

          if (pngIndex !== -1) {
              imageUrl = imageUrl.substring(0, pngIndex + 4); // Retain '.png' and part before it
          } else if (jpgIndex !== -1) {
              imageUrl = imageUrl.substring(0, jpgIndex + 4); // Retain '.jpg' and part before it
          }
          imageUrl = `https://unit-it.dk${imageUrl}`; // Prepend the base URL

          contacts.push({ name, title, unit, imageUrl });
      }
  });

  return contacts;
}

async function fetchAndCacheContacts() {
  const currentTime = new Date().getTime();
  if (!contactCache || currentTime - lastFetchTime > cacheDuration) {
      contactCache = await parseContacts('https://unit-it.dk/kontakt/');
      lastFetchTime = currentTime;
  }
  return contactCache;
}

async function getShuffledContacts(numContacts) {
  // Fetch and cache contacts
  const contacts = await fetchAndCacheContacts();

  for (let i = contacts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [contacts[i], contacts[j]] = [contacts[j], contacts[i]];
  }

  // Return the specified number of contacts
  return contacts.slice(0, numContacts);
}

function groupByUnit(contacts) {
  const grouped = {};
  contacts.forEach(contact => {
      if (contact.unit) { // Only add contact if the 'unit' field is not empty
          if (!grouped[contact.unit]) {
              grouped[contact.unit] = [];
          }
          grouped[contact.unit].push(contact);
      }
  });
  return grouped;
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


app.get('/getcontacts', async (req, res) => {
  const getAll = req.query.all === 'true';
  const numContacts = parseInt(req.query.num) || 3;

  if (!getAll && numContacts <= 0) {
      return res.status(400).json({ error: 'Number must be greater than 0' });
  }

  try {
      if (getAll) {
          const contacts = await fetchAndCacheContacts();
          res.json(contacts);
      } else {
          const selectedContacts = await getShuffledContacts(numContacts);
          res.json(selectedContacts);
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/unitmixedcontacts', async (req, res) => {
  try {
      const allContacts = await fetchAndCacheContacts();
      const groupedContacts = groupByUnit(allContacts);
      const units = Object.keys(groupedContacts).filter(unit => groupedContacts[unit].length > 1); // Only consider units with more than one contact

      // Randomly select one unit to get two contacts from
      const randomUnitIndex = Math.floor(Math.random() * units.length);
      const selectedUnit1 = units[randomUnitIndex];
      shuffleArray(groupedContacts[selectedUnit1]);

      // Randomly select another unit to get one contact from
      let selectedUnit2;
      do {
          const secondRandomUnitIndex = Math.floor(Math.random() * units.length);
          selectedUnit2 = units[secondRandomUnitIndex];
      } while (selectedUnit2 === selectedUnit1);

      shuffleArray(groupedContacts[selectedUnit2]);

      // Get two people from the first selected unit
      const contactsFromUnit1 = groupedContacts[selectedUnit1].slice(0, 2);

      // Get one person from the second selected unit
      const contactsFromUnit2 = [groupedContacts[selectedUnit2][0]];

      // Create the response object
  const response = [...contactsFromUnit1, { ...contactsFromUnit2[0], correctanswer: true }];;

      res.json(response);
  } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res.status(500).json({ error: 'Internal Server Error' });
  }
});







app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
