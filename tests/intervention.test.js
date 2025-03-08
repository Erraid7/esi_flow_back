const request = require('supertest');
const app = require('../server');
const { sequelize, Intervention } = require('../models');

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset DB before testing
}
);

describe('Intervention API Tests', () => {
    let interventionId;
  
    test('Should create an intervention', async () => {
      const res = await request(app).post('/api/interventions').send({
        equipementId: 1,
        technicienId: 1,
        statut: "En attente",
        priorite: "Moyenne"
      });
  
      expect(res.statusCode).toBe(201);
      expect(res.body.statut).toBe("En attente");
      interventionId = res.body.id;
    });
  
    test('Should update intervention status', async () => {
      const res = await request(app).put(`/api/interventions/${interventionId}`).send({
        statut: "Terminé"
      });
  
      expect(res.statusCode).toBe(200);
      expect(res.body.statut).toBe("Terminé");
    });
  });
  