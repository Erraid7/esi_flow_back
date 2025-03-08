const request = require('supertest');
const app = require('../server');
const { sequelize, Equipment } = require('../models');

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset DB before testing
    }
);

describe('Equipment API Tests', () => {
    let equipmentId;
    
    test('Should create new equipment', async () => {
      const res = await request(app).post('/api/equipment').send({
        nom: "Projector",
        type: "Electronics",
        localisation: "Room 101",
        etat: "Fonctionnel"
      });
  
      expect(res.statusCode).toBe(201);
      expect(res.body.nom).toBe("Projector");
      equipmentId = res.body.id;
    });
  
    test('Should fetch all equipment', async () => {
      const res = await request(app).get('/api/equipment');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
  