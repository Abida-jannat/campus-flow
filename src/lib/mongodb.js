import { MongoClient } from "mongodb";
import dns from "node:dns";

// Same fix already applied in lib/auth.js — some networks/ISPs fail to
// resolve the mongodb+srv:// SRV record correctly, causing ECONNREFUSED
// on _mongodb._tcp.<cluster>.mongodb.net. Forcing IPv4 first and using
// public DNS servers works around that.
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define MONGODB_URI inside your .env.local file");
}

console.log("URI:", uri);

const client = new MongoClient(uri, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
});

// Cache the connection promise across hot reloads in development so we
// don't open a new MongoDB connection on every file save.
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}export default clientPromise;