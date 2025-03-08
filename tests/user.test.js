const request = require('supertest');
const app = require('../server');
const { sequelize, User } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset DB before testing
});

describe('User API Tests', () => {
  let userId;
  
  test('Should create a new user', async () => {
    const res = await request(app).post('/api/users').send({
      nom: "Test User",
      email: "test@example.com",
      mot_de_passe: "password",
      role: "Technicien"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.com");
    userId = res.body.id;
  });

  test('Should fetch all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
