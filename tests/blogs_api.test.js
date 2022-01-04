import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import Blog from '../models/Blog.js';
import list from './list_helper.js';

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(list.testBlogs);
});

describe('test GET all blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(list.testBlogs.length);
  });

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs');
    const allBlogs = response.body;
    const titles = allBlogs.map(blog => blog.title);
    expect(titles).toContain('Book 2');
    expect(allBlogs[0].author).toBe('Jane Bob');
  });

  test('a returned blog has expected properties', async () => {
    const response = await api.get('/api/blogs');
    const blog1 = response.body[0];
    expect(blog1).toEqual(
      expect.objectContaining({ ...list.testBlogs[0] })
    );
    expect(blog1.id).toBeDefined();
    expect(blog1._id).not.toBeDefined();
  });
});

describe('test GET one specific blog', () => {
  test('specific blog is returned with a valid id query', async () => {
    const blogsInDB = await Blog.find({});
    const targetBlog = blogsInDB[0].toJSON();

    const response = await api
      .get(`/api/blogs/${targetBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual(targetBlog);
  });

  test('returns 404 with a nonexistent id query', async () => {
    await api
      .get(`/api/blogs/${list.nonexistentId}`)
      .expect(404);
  });

  test('returns 400 with a malformatted id query', async () => {
    await api
      .get(`/api/blogs/${list.malformattedId}`)
      .expect(400);
  });
});

describe('test POST a new blog', () => {
  test('adds a new blog - full blog', async () => {
    await api
      .post('/api/blogs')
      .send(list.fullBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    const allBlogs = response.body;
    expect(allBlogs).toHaveLength(list.testBlogs.length + 1);
    expect(allBlogs[list.testBlogs.length]).toEqual(
      expect.objectContaining({ ...list.fullBlog })
    );
  });

  test('adds a new blog - missing likes', async () => {
    await api
      .post('/api/blogs')
      .send(list.missingLikesBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    const allBlogs = response.body;
    expect(allBlogs).toHaveLength(list.testBlogs.length + 1);
    expect(allBlogs[list.testBlogs.length]).toEqual(
      expect.objectContaining({ ...list.missingLikesBlog, likes: 0 })
    );
  });

  test('does not add invalid blog - missing title', async () => {
    await api
      .post('/api/blogs')
      .send(list.missingTitleBlog)
      .expect(400);

    const response = await api.get('/api/blogs');
    const allBlogs = response.body;
    expect(allBlogs).toHaveLength(list.testBlogs.length);
  });

  test('does not add invalid blog - missing url', async () => {
    await api
      .post('/api/blogs')
      .send(list.missingUrlBlog)
      .expect(400);

    const response = await api.get('/api/blogs');
    const allBlogs = response.body;
    expect(allBlogs).toHaveLength(list.testBlogs.length);
  });
});

describe('test DELETE a specific blog', () => {
  test('specific blog deleted with a valid id query', async () => {
    const blogsInDB = await Blog.find({});
    const targetBlog = blogsInDB[0].toJSON();

    await api
      .delete(`/api/blogs/${targetBlog.id}`)
      .expect(204);

    await api
      .get(`/api/blogs/${targetBlog.id}`)
      .expect(404);
  });

  test('returns 204 with a nonexistent id query', async () => {
    await api
      .delete(`/api/blogs/${list.nonexistentId}`)
      .expect(204);
  });

  test('returns 400 with a malformatted id query', async () => {
    await api
      .delete(`/api/blogs/${list.malformattedId}`)
      .expect(400);
  });
});

describe('test UPDATE a specific blog', () => {
  test('specific blog updated with a valid id query and likes', async () => {
    const blogsInDB = await Blog.find({});
    const targetBlog = blogsInDB[0].toJSON();

    const putResponse = await api
      .put(`/api/blogs/${targetBlog.id}`)
      .send({ likes: targetBlog.likes + 5 })
      .expect(200);

    expect(putResponse.body).toEqual(
      { ...targetBlog, likes: targetBlog.likes + 5 }
    );

    const getResponse = await api
      .get(`/api/blogs/${targetBlog.id}`)
      .expect(200);

    expect(getResponse.body).toEqual(
      { ...targetBlog, likes: targetBlog.likes + 5 }
    );
  });

  test('returns 400 with invalid (negative) likes', async () => {
    const blogsInDB = await Blog.find({});
    const targetBlog = blogsInDB[0].toJSON();

    await api
      .put(`/api/blogs/${targetBlog.id}`)
      .send({ likes: -5 })
      .expect(400);

    const getResponse = await api
      .get(`/api/blogs/${targetBlog.id}`)
      .expect(200);

    expect(getResponse.body).toEqual(targetBlog);
  });

  test('returns 404 with a nonexistent id query', async () => {
    const blogsInDB = await Blog.find({});
    const targetBlog = blogsInDB[0].toJSON();

    await api
      .put(`/api/blogs/${list.nonexistentId}`)
      .send({ likes: targetBlog.likes + 5 })
      .expect(404);
  });

  test('returns 400 with a malformatted id query', async () => {
    const blogsInDB = await Blog.find({});
    const targetBlog = blogsInDB[0].toJSON();

    await api
      .put(`/api/blogs/${list.malformattedId}`)
      .send({ likes: targetBlog.likes + 5 })
      .expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
