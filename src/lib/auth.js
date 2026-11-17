import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client, DB_NAME } from "./mongodb";


const db = client.db(DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
    
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
      department: { type: "string", required: false, input: true },
      semester: { type: "string", required: false, input: true },
      studentId: { type: "string", required: false, input: true },
    },
  },
});
