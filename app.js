import config from './utils/config.js';
import express from 'express';
import cors from 'cors';
import blogsRouter from './controllers/blogs.js';
import usersRouter from './controllers/users.js';
import loginRouter from './controllers/login.js';
import middleware from './utils/middleware.js';
import logger from './utils/logger.js';
import mongoose from 'mongoose';

const app = express();
try {
  await mongoose.connect(config.MONGODB_URI);
  logger.info('connected to MongoDB');
} catch (error) {
  logger.error('error connection to MongoDB:', error.message);
}

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
