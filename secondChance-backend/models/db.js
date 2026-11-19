
require('dotenv').config();

const { MongoClient } = require('mongodb');

let dbInstance = null;
let client = null;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    const url = process.env.MONGO_URL;
    const dbName = process.env.MONGO_DB;

    if (!url) {
        throw new Error('MONGO_URL is missing from .env');
    }

    if (!dbName) {
        throw new Error('MONGO_DB is missing from .env');
    }

    client = new MongoClient(url);

    // Task 1: Connect to MongoDB
    await client.connect();

    console.log('Connected to MongoDB successfully');

    // Task 2: Assign database instance
    dbInstance = client.db(dbName);

    // Task 3: Return database instance
    return dbInstance;
}

module.exports = connectToDatabase;
