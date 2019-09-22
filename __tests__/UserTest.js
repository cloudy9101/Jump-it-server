const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

const { app } = require('../app');

describe('after sign in', () => {
  let token;
  beforeAll(async () => {
    const user = new User({
      email: "test@test.com",
      password: "123123"
    });
    await user.save();
    const payload = {
      id: user._id
    };
    token = await jwt.sign(payload, config.privateKey);
  });

  test("find user", async (done) => {
    const response = await request(app)
      .get('/api/users/find')
      .set('Authorization', 'Bearer ' + token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.data.email).toBe('test@test.com');
    done();
  });
})