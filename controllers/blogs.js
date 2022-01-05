import express from 'express';
import { Blog } from '../models/Blog.js';
import { User, ObjectId } from '../models/User.js';
import middleware from '../utils/middleware.js';

const blogsRouter = express.Router();
const userExtractor = middleware.userExtractor;

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
      .populate('user', { username: 1, name: 1 });
    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      response.status(404).end();
    } else {
      response.json(blog);
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    const user = request.user;
    const blog = new Blog({ ...request.body, user: user._id });

    const addedBlog = await blog.save();
    user.blogs = (user.blogs || []).concat(addedBlog._id);

    await user.save({ validateModifiedOnly: true });
    response.status(201).json(addedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user;
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      return response.status(404).end();
    }

    if (blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndDelete(request.params.id);
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

blogsRouter.put('/:id', async (request, response, next) => {
  const likes = request.body.likes;
  try {
    const blog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!blog) {
      response.status(404).end();
    } else {
      response.json(blog);
    }
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
