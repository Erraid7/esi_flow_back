module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("equipments", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.ENUM("computer", "printer", "network_device", "other"), allowNull: false },
      category: { type: Sequelize.ENUM("hardware", "software", "furniture", "other"), allowNull: false },
      acquisition_date: { type: Sequelize.DATE },
      date_of_commissioning: { type: Sequelize.DATE },
      localisation: { type: Sequelize.STRING },
      eqp_status: { type: Sequelize.ENUM("working", "needs_maintenance", "out_of_service"), allowNull: false },
      documentation: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("equipments");
  }
};
