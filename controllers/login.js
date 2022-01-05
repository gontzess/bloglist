import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const loginRouter = express.Router();

loginRouter.post('/', async (request, response, next) => {
  const body = request.body;
  try {
    const user = await User.findOne({ username: body.username });
    let passwordCorrect;
    if (user === null) {
      passwordCorrect = false;
    } else {
      passwordCorrect = await bcrypt.compare(body.password, user.passwordHash);
    }
    if (!user || !passwordCorrect) {
      return response.status(401).json(
        { error: 'invalid username or password' }
      );
    }

    const { username, name, _id } = user;
    const token = jwt.sign(
      { username, id: _id },
      process.env.SECRET,
      { expiresIn: 60 * 60 }
    );
    response.status(200).send({ token, username, name });
  } catch (error) {
    next(error);
  }
});

export default loginRouter;
