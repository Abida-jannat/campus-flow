import { MongoClient } from "mongodb";
import dns from "node:dns";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable (.env.local)");
}

export const DB_NAME = process.env.MONGODB_DB || "campus-flow";

if (process.env.NODE_ENV !== "production") {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}


const cache = (global._campusFlowMongo ??= { client: null, promise: null });

if (!cache.client) {
  cache.client = new MongoClient(uri, {
    maxPoolSize: 10,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000, 
  });
}

export const mongoClient = cache.client;


function connect() {
  if (!cache.promise) {
    cache.promise = mongoClient.connect().catch((err) => {
      cache.promise = null; 
      throw err;
    });
  }
  return cache.promise;
}


export async function getDb() {
  await connect();
  return mongoClient.db(DB_NAME);
}


const clientPromise = connect();
clientPromise.catch(() => {}); 
export default clientPromise;
