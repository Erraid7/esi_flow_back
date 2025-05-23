module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      role: { type: Sequelize.ENUM("Admin", "Technician", "Personal"), allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING },
      bio: { type: Sequelize.TEXT },
      profession: { type: Sequelize.ENUM(
        "Teacher",   
        "Security", 
        "Cleaning", 
        "Student", 
        "Researcher",
        "IT Technician",         // General IT support, software/hardware maintenance
        "Network Technician",    // Manages routers, switches, and networking issues
        "Server Administrator",  // Responsible for servers, data centers
        "Security Technician",   // Handles firewall, cybersecurity, and access control
        "Electrical Technician", // Maintains electrical systems, wiring, circuits
        "Mechanical Technician", // Repairs heavy machinery, HVAC, electromechanical systems
        "Multimedia Technician", // Manages projectors, sound systems, multimedia devices
        "Lab Technician",        // Handles laboratory equipment, testing instruments
        "HVAC Technician",       // Heating, ventilation, and air conditioning systems
        "Plumber",               // Repairs and installs plumbing fixtures
        "Carpenter",             // Constructs and repairs wooden structures
        "Painter",               // Paints walls, ceilings, and other surfaces
        "Gardener",              // Maintains gardens, lawns, and outdoor areas
        "Driver",                // Transports people, goods, or equipment
        "Office Equipment Technician", // Maintains printers, scanners, photocopiers 
        "Other"
      ), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("users");
  }
};
