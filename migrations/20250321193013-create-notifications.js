module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("notifications", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      recipient_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: "users", key: "id" }, 
        onDelete: "CASCADE" 
      },
      message: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.ENUM("info", "warning", "error", "success"), allowNull: false },
      request_id: { 
        type: Sequelize.INTEGER, 
        references: { model: "requests", key: "id" }, 
        onDelete: "SET NULL" 
      },
      intervention_id: { 
        type: Sequelize.INTEGER, 
        references: { model: "interventions", key: "id" }, 
        onDelete: "SET NULL" 
      },
      delivery_method: { type: Sequelize.ENUM("email", "sms", "app_notification"), allowNull: false },
      seen: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("notifications");
  }
};
