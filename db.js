/** Database connection for messagely. */

import { Client } from "pg";
import { DB_URI } from "./config.js";

const client = new Client(DB_URI);

client.connect();

export default client;
