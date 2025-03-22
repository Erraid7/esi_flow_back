module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("equipments", "maintenance_history", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("equipments", "maintenance_history");
  }
};
