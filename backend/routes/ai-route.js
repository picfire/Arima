const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get trained model
router.get('/api/model', (req, res) => {
    try {
        const modelPath = path.join(__dirname, '..', 'models', 'trained-model.json');
        const modelData = fs.readFileSync(modelPath, 'utf8');
        res.json(JSON.parse(modelData));
    } catch (error) {
        console.error('Error loading model:', error);
        res.status(500).json({ error: 'Error loading model' });
    }
});

module.exports = router;