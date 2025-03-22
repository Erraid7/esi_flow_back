module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("requests", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      requester_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: "users", key: "id" }, 
        onDelete: "CASCADE" 
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      localisation: { type: Sequelize.STRING },
      equipment_id: { 
        type: Sequelize.INTEGER, 
        references: { model: "equipments", key: "id" }, 
        onDelete: "SET NULL" 
      },
      priority: { type: Sequelize.ENUM("low", "medium", "high"), allowNull: false },
      picture: { type: Sequelize.TEXT, allowNull: true },
      req_status: { type: Sequelize.ENUM("To Do", "In Progress", "Pending", "Completed"), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("requests");
  }
};
