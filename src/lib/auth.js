import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { mongoClient, DB_NAME } from "@/lib/mongodb";

const db = mongoClient.db(DB_NAME);

const ALLOWED_SIGNUP_ROLES = ["student", "teacher"];

export const auth = betterAuth({
  database: mongodbAdapter(db, { client: mongoClient }),

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

  databaseHooks: {
    user: {
      create: {
     
        before: async (user) => ({
          data: {
            ...user,
            role: ALLOWED_SIGNUP_ROLES.includes(user.role) ? user.role : "student",
          },
        }),
      },
    },
  },
});
