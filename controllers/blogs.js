import express from 'express';
import Blog from '../models/Blog.js';

const blogsRouter = express.Router();

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({});
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

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body);
  try {
    const addedBlog = await blog.save();
    response.status(201).json(addedBlog);
  } catch (error) {
    next(error);
  }
});



export default blogsRouter;
