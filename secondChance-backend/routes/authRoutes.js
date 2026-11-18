const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectToDatabase = require('../models/db');
const logger = require('../logger');

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB
        const db = await connectToDatabase();

        // Task 2: Access users collection
        const users = db.collection('users');

        const { email, password, firstName, lastName } = req.body;

        // Task 3: Check existing user
        const existingUser = await users.findOne({ email });

        if (existingUser) {
            logger.error('Email id already exists');
            return res.status(400).json({
                error: 'Email id already exists'
            });
        }

        // Task 4: Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Task 5: Insert user
        const newUser = await users.insertOne({
            email,
            firstName,
            lastName,
            password: hash,
            createdAt: new Date()
        });

        // Task 6: Generate JWT
        const payload = {
            user: {
                id: newUser.insertedId
            }
        };

        const authtoken = jwt.sign(
            payload,
            process.env.JWT_SECRET
        );

        // Task 7: Log registration
        logger.info(`User registered successfully: ${email}`);

        // Task 8: Return email and token
        return res.status(201).json({
            email,
            token: authtoken
        });

    } catch (e) {
        logger.error(e);
        console.error('Registration error:', e);

        return res.status(500).send('Internal server error');
    }
});


router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to secondChance MongoDB
        const db = await connectToDatabase();

        // Task 2: Access users collection
        const users = db.collection('users');

        const { email, password } = req.body;

        // Task 3: Find user by email
        const user = await users.findOne({ email });

        // Task 7: Check if user exists
        if (!user) {
            logger.error(`User not found: ${email}`);
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Task 4: Compare entered password with encrypted password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logger.error('Passwords do not match');
            return res.status(400).json({
                error: 'Invalid Credentials'
            });
        }

        // Task 5: Fetch user details
        const userName = `${user.firstName} ${user.lastName}`;
        const userEmail = user.email;

        // Task 6: Create JWT authentication
        const payload = {
            user: {
                id: user._id
            }
        };

        const authtoken = jwt.sign(
            payload,
            process.env.JWT_SECRET
        );

        logger.info(`User logged in successfully: ${email}`);

        // Return authentication token and user details
        return res.json({
            authtoken,
            userName,
            userEmail
        });

    } catch (e) {
        logger.error(e);
        console.error('Login error:', e);
        return res.status(500).send('Internal server error');
    }
});


module.exports = router;
