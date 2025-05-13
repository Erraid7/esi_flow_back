module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("equipments", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.ENUM(
        "Lightweight", "Heavyweight", "Motorcycle", "Desktop", "Laptop", "Server", 
        "Router", "Switch", "Firewall", "Projector", "Printer", "Scanner", 
        "Oscilloscope", "3D Printer", "Desk", "Chair", "Window", "Door", 
        "Electromenager", "Heating", "Radiator", "Air Conditioner", "Other"
      ), allowNull: false },
      category: { type: Sequelize.ENUM(
        "Vehicle", "Computing Device", "Networking Equipment", "Storage Device", 
        "Multimedia Equipment", "Office Equipment", "Laboratory Equipment", 
        "Furniture", "Building Component", "Appliance", "HVAC", "Other"
      ), allowNull: false },
      acquisition_date: { type: Sequelize.DATE },
      date_of_commissioning: { type: Sequelize.DATE },
      localisation: { type: Sequelize.STRING },
      eqp_status: { type: Sequelize.ENUM("Working", "Needs Maintenance", "Out of service"), allowNull: false },
      documentation: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("equipments");
  }
};
