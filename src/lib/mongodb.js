import { MongoClient } from "mongodb";
import dns from "node:dns";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable (.env.local)");
}

dns.setDefaultResultOrder("ipv4first");

// Only needed on some home/ISP networks where mongodb+srv DNS lookups fail.
// Vercel's DNS works fine, and calling this on every cold start is wasted work.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

export const DB_NAME = process.env.MONGODB_DB || "campus-flow";

const options = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
  maxIdleTimeMS: 60000,
};

// ONE client for the whole app (API routes AND better-auth), cached on
// globalThis so dev hot-reloads and warm serverless invocations reuse the
// same connection pool instead of opening a new one each time.
const g = globalThis;
if (!g._campusflowMongo) {
  const client = new MongoClient(uri, options);
  const promise = client.connect();
  promise.catch(() => {}); // avoid "unhandled rejection" noise; callers still see the error when they await
  g._campusflowMongo = { client, promise };
}

export const client = g._campusflowMongo.client;
const clientPromise = g._campusflowMongo.promise;

export async function getDb() {
  await clientPromise;
  return client.db(DB_NAME);
}

export default clientPromise;
