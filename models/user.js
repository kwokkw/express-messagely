/** User class for message.ly */

import db from "../db.js";
import bcrypt from "bcrypt";
import BCRYPT_WORK_FACTOR from "../config.js";
import authenticateJWT from "../middleware/auth.js";

/** User of the site. */

class User {
  constructor(username, password, first_name, last_name, phone) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedpassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `
      INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone
    `,
      [username, password, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await query(
      `SELECT username, password 
       FROM users
       WHERE username = $1`,
      [username]
    );
    const user = results.rows[0];

    // Return true or false
    return await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(
      `
      UPDATE users
      SET last_login_at = current_timestamp
      WEHRE username = $1`,
      [username]
    );

    return { msg: "Login time stamp updated" };
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users`);

    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
             first_name,
             last_name,
             phone,
             join_at,
             last_login_at FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new Error(`No such user: ${username}`);
    }

    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    // Retrieving messages sent by a user
    // 1. Find messages sent by `username`
    // 2. For each message
    //    - Look up `to_username` in the `users`
    //      table to get recipient details.

    const results = await db.query(
      `
      SELECT m.id, 
        m.to_user, 
        m.body, 
        m.sent_at, 
        m.read_at,
        u.username
        u.first_name,
        u.last_name,
        u.phone
      FROM messages AS m
      JOIN users AS u
      ON m.to_username = u.username
      WHERE from_username = $1
      `,
      [username]
    );

    return results.rows.map((m) => ({
      id: m.id,
      to_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    // Retrieving messages sent to a user
    const results = await db.query(
      `
      SELECT 
        m.id, 
        m.body, 
        m.sent_at, 
        m.read_at,
        u.username, 
        u.first_name,
        u.last_name,
        u.phone
      FROM messages AS m
      JOIN users AS u
      ON m.from_username = u.username
      WHERE to_username = $1
      `,
      [username]
    );

    return results.rows.map((m) => ({
      id: m.id,
      from_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }
}

module.exports = User;
