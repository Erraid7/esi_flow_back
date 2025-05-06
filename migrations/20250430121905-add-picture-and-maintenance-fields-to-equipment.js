module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("equipments", "picture", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "https://yourdomain.com/defaults/equipment.png",
    });

    await queryInterface.addColumn("equipments", "automatic_maintenance_interval", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("equipments", "seasonal_maintenance_months", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("equipments", "picture");
    await queryInterface.removeColumn("equipments", "automatic_maintenance_interval");
    await queryInterface.removeColumn("equipments", "seasonal_maintenance_months");
  }
};
