import { Router } from "express";
import ExpressError from "../expressError.js";
import { sign } from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";
import User from "../models/user.js";

const router = new Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }

    // Authentication
    if (User.authenticate(username, password)) {
      const token = sign({ username }, SECRET_KEY);

      User.updateLoginTimestamp(username);

      return res.json({ token });
    }

    throw new ExpressError("Invalid username/password", 400);
  } catch (e) {
    return next(e);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    if (!username || !password || !first_name || !last_name || !phone) {
      throw new ExpressError("All field are required", 400);
    }

    // save to db
    if (User.register(username, password, first_name, last_name, phone)) {
      const token = sign({ username }, SECRET_KEY);
      return res.json({ token });
    }

    throw new ExpressError("Error registering user, please try again.", 500);
  } catch (error) {
    return next(error);
  }
});
