const { MongoClient } = require("mongodb");

//Connection to ATLAS mongodb
const main = async () => {
  const uri =
    "mongodb+srv://hyfuser:hyfpassword@cluster0.6enaegs.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    //await deleteListingsScrapedBeforeDate(client, new Date("2022-05-13"));

    await findAllListings(client);
    //await deleteListingByName(client, "Rock 'n Role");

    //await updateListingsToHavePropertyType(client);
    /*  await upsertListingByName(client, "Rock 'n Role", {
      name: "Rock 'n Role",
      bedrooms: 3,
      bathrooms: 1,
    }); */

    //await updateListingByName(client, "Lake House", { bedrooms: 15, beds: 5 });

    /*  await findListingsByRoomCapacity(client, {
      minBedroomAmount: 3,
      minBathroomAmount: 2,
      maxResultAmount: 5,
    }); */

    // await findListingByName(client, "Lake House");

    /* await createListings(client, [
      {
        name: "Lake House",
        bedrooms: 5,
        summary: "Beautiful lake landscape",
        bathrooms: 2,
        price: "80 euro",
        isAvailable: true,
      },
      {
        name: "Tiny app",
        bedrooms: 1,
        summary: "A small flat in Amsterdam",
        bathrooms: 1,
        price: "30 euro",
        isAvailable: true,
      },
      {
        name: "Big House",
        bedrooms: 5,
        summary: "For huge families",
        bathrooms: 3,
        price: "70 euro",
        isAvailable: true,
        extras: ["swimming pool", "game room", "cinema room"],
      },
    ]); */
    /* await createListing(client, {
      name: "Lovely Loft",
      bedrooms: 2,
      summary: "A charming loft in Paris.",
      bathrooms: 1,
      price: "40 euro",
      isAvailable: true,
    }); */

    //await listDatabases(client);
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
};

main().catch(console.error);

//Listing Databases
const listDatabases = async (client) => {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(`--${db.name}`));
};
//Create a new document into a collection
const createListing = async (client, newListing) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertOne(newListing);
  console.log(`New data created in db with id: ${result.insertedId}`);
};

//Create many documents into a collection

const createListings = async (client, newListings) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertMany(newListings);
  console.log(
    `New ${result.insertedCount} documents created in db with ids: ${result.insertedIds}`
  );
};

//Find document from collection

const findListingByName = async (client, name) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .findOne({ name: name });
  if (result) {
    console.log(`Found a listing in the collection with the name '${name}'`);
    console.log(result);
  } else {
    console.log(`No listings found with the name '${name}'`);
  }
};

//Find documents with limited amount and for this function min number of bedrooms and bathrooms and most reviewed.

const findListingsByRoomCapacity = async (
  client,
  {
    minBedroomAmount = 0,
    minBathroomAmount = 0,
    maxResultAmount = Number.MAX_SAFE_INTEGER,
  } = {}
) => {
  const cursor = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({
      bedrooms: { $gte: minBedroomAmount }, //$gte means greater or equal then minBedroomAmount
      bathrooms: { $gte: minBathroomAmount },
    })
    .sort({ last_review: -1 })
    .limit(maxResultAmount); //{last_review:-1} is sorting desc for last_reviews

  const results = await cursor.toArray();
  if (results.length > 0) {
    results.forEach((result) =>
      console.log(result.name, result.bedrooms, result.bathrooms)
    );
  } else {
    console.log("We could not find any result...");
  }
};

//Update a document from collection

const updateListingByName = async (client, name, newProperties) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne({ name: name }, { $set: newProperties });

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document(s) was/were modified.`);
};
// Upsert if there is a document modifies if not create new document
const upsertListingByName = async (client, name, newProperties) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne({ name: name }, { $set: newProperties }, { upsert: true });

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  if (result.upsertedCount > 0) {
    console.log(`One document was inserted with the id ${result.upsertedId}`);
  } else {
    console.log(`${result.modifiedCount} document(s) was/were modified.`);
  }
};

// Update many documents
const updateListingsToHavePropertyType = async (client) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateMany(
      { property_type: { $exists: false } },
      { $set: { property_type: "Unknown" } }
    );

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document(s) was/were modified.`);
};
// Deletes one document
const deleteListingByName = async (client, name) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteOne({ name: name });

  console.log(`${result.deletedCount} document(s) deleted`);
};
//Deletes many documents

const deleteListingsScrapedBeforeDate = async (client, date) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteMany({ last_scraped: { $lt: date } });

  console.log(`${result.deletedCount} document(s) deleted`);
};

//Finds every document in collection and returns only name and bedrooms property

const findAllListings = async (client) => {
  const cursor = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({}, { name: true, bedrooms: true, _id: false, bathrooms: false });

  const results = await cursor.toArray();
  console.log(results);
};
