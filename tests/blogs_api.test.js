import mongoose from 'mongoose';
import supertest from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { Blog } from '../models/Blog.js';
import { User } from '../models/User.js';
import helper from './test_helper.js';

const api = supertest(app);

describe('testing "api/blogs" endpoint', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    const { username, password, name } = helper.testUsers[0];
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username, passwordHash, name });
    await user.save();
    // await Blog.insertMany(helper.testBlogs);
    for (let blogData of helper.testBlogs) {
      let blog = new Blog({ ...blogData, user: user._id });
      await blog.save();
    }
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
      expect(response.body).toHaveLength(helper.testBlogs.length);
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
      expect(blog1).toMatchObject(helper.testBlogs[0]);
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

      expect(JSON.stringify(response.body))
        .toBe(JSON.stringify(targetBlog));
    });

    test('returns 404 with a nonexistent id query', async () => {
      await api
        .get(`/api/blogs/${helper.nonexistentId}`)
        .expect(404);
    });

    test('returns 400 with a malformatted id query', async () => {
      await api
        .get(`/api/blogs/${helper.malformattedId}`)
        .expect(400);
    });
  });

  describe('test POST a new blog', () => {
    let token;
    beforeEach(async () => {
      const { username, password } = helper.testUsers[0];
      const res = await api.post('/api/login').send({ username, password });
      token = 'bearer ' + res.body.token;
    });

    test('adds a new blog - full blog', async () => {
      const postResponse = await api
        .post('/api/blogs')
        .set({ 'Authorization': token })
        .send(helper.fullBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const response = await api.get('/api/blogs');
      const allBlogs = response.body;
      expect(allBlogs).toHaveLength(helper.testBlogs.length + 1);
      expect(allBlogs[helper.testBlogs.length])
        .toMatchObject(helper.fullBlog);
    });

    test('returns 401 when invalid authentication', async () => {
      await api
        .post('/api/blogs')
        .set({ 'Authorization': 'bearer wrongo' })
        .send(helper.fullBlog)
        .expect(401);

      const response = await api.get('/api/blogs');
      const allBlogs = response.body;
      expect(allBlogs).toHaveLength(helper.testBlogs.length);
    });

    test('adds a new blog - missing likes', async () => {
      await api
        .post('/api/blogs')
        .set({ 'Authorization': token })
        .send(helper.missingLikesBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const response = await api.get('/api/blogs');
      const allBlogs = response.body;
      expect(allBlogs).toHaveLength(helper.testBlogs.length + 1);
      expect(allBlogs[helper.testBlogs.length])
        .toMatchObject({ ...helper.missingLikesBlog, likes: 0 });
    });

    test('does not add invalid blog - missing title', async () => {
      await api
        .post('/api/blogs')
        .set({ 'Authorization': token })
        .send(helper.missingTitleBlog)
        .expect(400);

      const response = await api.get('/api/blogs');
      const allBlogs = response.body;
      expect(allBlogs).toHaveLength(helper.testBlogs.length);
    });

    test('does not add invalid blog - missing url', async () => {
      await api
        .post('/api/blogs')
        .set({ 'Authorization': token })
        .send(helper.missingUrlBlog)
        .expect(400);

      const response = await api.get('/api/blogs');
      const allBlogs = response.body;
      expect(allBlogs).toHaveLength(helper.testBlogs.length);
    });
  });

  describe('test DELETE a specific blog', () => {
    let token;
    beforeEach(async () => {
      const { username, password } = helper.testUsers[0];
      const res = await api.post('/api/login').send({ username, password });
      token = 'bearer ' + res.body.token;
    });

    test('specific blog deleted with a valid id query', async () => {
      const blogsInDB = await Blog.find({});
      const targetBlog = blogsInDB[0].toJSON();

      await api
        .delete(`/api/blogs/${targetBlog.id}`)
        .set({ 'Authorization': token })
        .expect(204);

      let check = await api
        .get(`/api/blogs/${targetBlog.id}`)
        .expect(404);
    });

    test('returns 401 when invalid authentication', async () => {
      const blogsInDB = await Blog.find({});
      const targetBlog = blogsInDB[0].toJSON();

      await api
        .delete(`/api/blogs/${targetBlog.id}`)
        .set({ 'Authorization': 'bearer wrongo' })
        .expect(401);

      const response = await api.get('/api/blogs');
      const allBlogs = response.body;
      expect(allBlogs).toHaveLength(helper.testBlogs.length);
    });

    test('returns 404 with a nonexistent id query', async () => {
      await api
        .delete(`/api/blogs/${helper.nonexistentId}`)
        .set({ 'Authorization': token })
        .expect(404);
    });

    test('returns 400 with a malformatted id query', async () => {
      await api
        .delete(`/api/blogs/${helper.malformattedId}`)
        .set({ 'Authorization': token })
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

      expect(JSON.stringify(putResponse.body))
        .toBe(JSON.stringify({ ...targetBlog, likes: targetBlog.likes + 5 }));

      const getResponse = await api
        .get(`/api/blogs/${targetBlog.id}`)
        .expect(200);

      expect(JSON.stringify(getResponse.body))
        .toBe(JSON.stringify({ ...targetBlog, likes: targetBlog.likes + 5 }));
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

      expect(JSON.stringify(getResponse.body))
        .toBe(JSON.stringify(targetBlog));
    });

    test('returns 404 with a nonexistent id query', async () => {
      const blogsInDB = await Blog.find({});
      const targetBlog = blogsInDB[0].toJSON();

      await api
        .put(`/api/blogs/${helper.nonexistentId}`)
        .send({ likes: targetBlog.likes + 5 })
        .expect(404);
    });

    test('returns 400 with a malformatted id query', async () => {
      const blogsInDB = await Blog.find({});
      const targetBlog = blogsInDB[0].toJSON();

      await api
        .put(`/api/blogs/${helper.malformattedId}`)
        .send({ likes: targetBlog.likes + 5 })
        .expect(400);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
