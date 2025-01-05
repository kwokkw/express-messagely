/** Common config for message.ly */

// read .env files and make environmental variables

import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

const DB_URI =
  process.env.NODE_ENV === "test"
    ? "postgresql:///messagely_test"
    : "postgresql:///messagely";

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;

export default {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};
