
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const logger = require('./logger');

// Task 1: Import natural library
const natural = require('natural');

// Task 2: Initialize Express server
const app = express();
const port = process.env.PORT || 3000;

const expressPino = require('express-pino-logger')({ logger });

app.use(express.json());
app.use(expressPino);

// Task 3: Create POST /sentiment route
app.post('/sentiment', async (req, res) => {

    // Task 4: Extract sentence from query parameters
    const { sentence } = req.query;

    if (!sentence) {
        logger.error('No sentence provided');
        return res.status(400).json({ error: 'No sentence provided' });
    }

    // Initialize sentiment analyzer
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer("English", stemmer, "afinn");

    // Perform sentiment analysis
    try {
        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        let sentiment = "neutral";

        // Task 5: Set sentiment based on score
        if (analysisResult < 0) {
            sentiment = "negative";
        } else if (analysisResult > 0) {
            sentiment = "positive";
        }

        // Logging the result
        logger.info(`Sentiment analysis result: ${analysisResult}`);

        // Task 6: Return successful response
        return res.status(200).json({
            sentimentScore: analysisResult,
            sentiment: sentiment
        });

    } catch (error) {
        logger.error(`Error performing sentiment analysis: ${error}`);

        // Task 7: Return error response
        return res.status(500).json({
            message: 'Error performing sentiment analysis'
        });
    }
});

// Start server
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
