import mongoose from 'mongoose';
import supertest from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';
import { Blog } from '../models/Blog.js';
import { User } from '../models/User.js';
import helper from './test_helper.js';

const api = supertest(app);

describe('testing "api/users" endpoint', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    const { username, password, name } = helper.testUsers[0];
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username, passwordHash, name });
    await user.save();
  });

  describe('test POST a new user', () => {
    test('adds user when valid data', async () => {
      const postResponse = await api
        .post('/api/users')
        .send(helper.testUsers[1])
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const user1 = postResponse.body;
      const getResponse = await api
        .get('/api/users')
        .expect(200);

      expect(getResponse.body).toContainEqual(user1);
      expect(getResponse.body).toHaveLength(2);
    });

    test('added valid user has expected properties', async () => {
      const { username, name } = helper.testUsers[1];
      const response = await api
        .post('/api/users')
        .send(helper.testUsers[1])
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const user1 = response.body;
      expect(user1).toMatchObject({ username, name });
      expect(user1.id).toBeDefined();
      expect(user1._id).not.toBeDefined();
      expect(user1.password).not.toBeDefined();
      expect(user1.passwordHash).not.toBeDefined();
    });

    test('returns 400 error if username already taken', async () => {
      const usersInDBStart = await User.find({});
      const existingUser = usersInDBStart[0].toJSON();
      const newUser = {
        username: existingUser.username,
        password: 'couldbeanything',
        name: existingUser.name,
        blogs: []
      };

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(response.body.error).toContain('already exists');

      const usersInDBEnd = await User.find({});
      expect(usersInDBEnd).toHaveLength(usersInDBStart.length);
    })
  });

  describe('test GET all users', () => {
    test('returns the only user when one', async () => {
      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toHaveLength(1);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
