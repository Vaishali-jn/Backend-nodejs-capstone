const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        const db = await connectToDatabase();

        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item

router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        // Task 1: Retrieve database connection
        const db = await connectToDatabase();

        // Task 2: Retrieve collection
        const collection = db.collection('secondChanceItems');

        // Task 3: Create new item from request body
        let secondChanceItem = req.body;

        // Task 4: Get last ID and increment by 1
        const lastItem = await collection.find().sort({ id: -1 }).limit(1).toArray();

        if (lastItem.length > 0) {
            secondChanceItem.id = (parseInt(lastItem[0].id, 10) + 1).toString();
        } else {
            secondChanceItem.id = '1';
        }

        // Task 5: Set current date
        const date_added = Math.floor(Date.now() / 1000);
        secondChanceItem.date_added = date_added;

        // Task 6: Add item to database
        await collection.insertOne(secondChanceItem);

        // Task 7: Upload image to images directory
        if (req.file) {
            secondChanceItem.image = req.file.filename;

            await collection.updateOne(
                { id: secondChanceItem.id },
                { $set: { image: req.file.filename } }
            );
        }

        res.status(201).json(secondChanceItem);

    } catch (e) {
        logger.error('Error adding second chance item', e);
        next(e);
    }
});


// Get a single secondChanceItem by ID

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        // Task 1: Retrieve database connection
        const db = await connectToDatabase();

        // Task 2: Retrieve collection
        const collection = db.collection('secondChanceItems');

        // Task 3: Find item by ID
        const secondChanceItem = await collection.findOne({
            id: req.params.id
        });

        // Task 4: Return item or error message
        if (!secondChanceItem) {
            return res.status(404).json({
                message: 'Second chance item not found'
            });
        }

        res.json(secondChanceItem);

    } catch (e) {
        next(e);
    }
});


// Update and existing item

// Update an existing secondChanceItem
router.put('/:id', async (req, res, next) => {
    try {
        // Task 1: Retrieve database connection
        const db = await connectToDatabase();

        // Task 2: Retrieve collection
        const collection = db.collection('secondChanceItems');

        // Get item ID
        const id = req.params.id;

        // Task 3: Check if item exists
        const secondChanceItem = await collection.findOne({ id: id });

        if (!secondChanceItem) {
            return res.status(404).json({
                message: 'Second chance item not found'
            });
        }

        // Task 4: Update item attributes
        const updatedItem = {
            category: req.body.category,
            condition: req.body.condition,
            age_days: req.body.age_days,
            description: req.body.description,
            age_years: (parseFloat(req.body.age_days) / 365).toFixed(1),
            updatedAt: Math.floor(Date.now() / 1000)
        };

        await collection.updateOne(
            { id: id },
            { $set: updatedItem }
        );

        // Task 5: Send confirmation
        res.status(200).json({
            message: 'Second chance item updated successfully'
        });

    } catch (e) {
        logger.error('Error updating second chance item', e);
        next(e);
    }
});



// Delete an existing secondChanceItem
router.delete('/:id', async (req, res, next) => {
    try {
        // Task 1: Retrieve database connection
        const db = await connectToDatabase();

        // Task 2: Retrieve collection
        const collection = db.collection('secondChanceItems');

        // Get item ID
        const id = req.params.id;

        // Task 3: Find item by ID
        const secondChanceItem = await collection.findOne({ id: id });

        if (!secondChanceItem) {
            return res.status(404).json({
                message: 'Second chance item not found'
            });
        }

        // Task 4: Delete item
        await collection.deleteOne({ id: id });

        // Send confirmation
        res.status(200).json({
            message: 'Second chance item deleted successfully'
        });

    } catch (e) {
        logger.error('Error deleting second chance item', e);
        next(e);
    }
});


module.exports = router;
