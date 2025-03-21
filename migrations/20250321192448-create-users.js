module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      role: { type: Sequelize.ENUM("admin", "technician", "personal"), allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING },
      bio: { type: Sequelize.TEXT },
      profession: { type: Sequelize.ENUM("teacher", "staff", "other"), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("users");
  }
};
