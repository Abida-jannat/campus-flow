import { MongoClient } from "mongodb";

console.log("URI:", process.env.MONGODB_URI);

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

const clientPromise = client.connect();

export default clientPromise;
