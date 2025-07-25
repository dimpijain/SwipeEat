const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../data/mockRestaurants.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading restaurant data:', err);
      return res.status(500).json({ error: 'Failed to load restaurant data' });
    }
    return res.json(JSON.parse(data));
  });
});

module.exports = router;
