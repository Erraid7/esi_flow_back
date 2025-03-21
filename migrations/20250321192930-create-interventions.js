module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("interventions", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      report: { type: Sequelize.TEXT, allowNull: false },
      technician_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: "users", key: "id" }, 
        onDelete: "CASCADE" 
      },
      intv_status: { type: Sequelize.ENUM("planned", "in_progress", "completed", "cancelled"), allowNull: false },
      deadline: { type: Sequelize.DATE },
      date_creation: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      date_cloture: { type: Sequelize.DATE },
      updated_at: { type: Sequelize.DATE },
      request_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: "requests", key: "id" }, 
        onDelete: "CASCADE" 
      },
      intervention_type: { type: Sequelize.ENUM("repair", "maintenance", "replacement"), allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("interventions");
  }
};
