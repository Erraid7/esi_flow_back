module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("requests", "request_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("requests", "request_code");
  },
};
