'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Interventions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      equipementId: {
        type: Sequelize.INTEGER
      },
      technicienId: {
        type: Sequelize.INTEGER
      },
      statut: {
        type: Sequelize.STRING
      },
      priorite: {
        type: Sequelize.STRING
      },
      date_creation: {
        type: Sequelize.DATE
      },
      date_cloture: {
        type: Sequelize.DATE
      },
      rapport: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Interventions');
  }
};