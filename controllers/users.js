import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

const usersRouter = express.Router();

usersRouter.post('/', async (request, response, next) => {
  const { username, password, name } = request.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash, name });
    const savedUser = await user.save();
    response.json(savedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({}).populate('blogs', { title: 1, url: 1 });
    response.json(users);
  } catch (error) {
    error(next);
  }
});

export default usersRouter;
