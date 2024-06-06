const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require('./data.js');
const dbUrl = process.env.ATLATDB_URL;

async function main() {
    try {
        await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connection Successful..");
        
        await initDB();
    } catch (err) {
        console.error("Connection error", err);
    }
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});
        console.log("Existing data deleted.");
     
        const listingsWithOwner = initData.data.map((obj) => ({ ...obj, owner: "66575c35f453cfecac2f5ede" }));
        await Listing.insertMany(listingsWithOwner);

        console.log("Data is initialized.");
    } catch (err) {
        console.error("Error initializing data", err);
    }
};

main();
