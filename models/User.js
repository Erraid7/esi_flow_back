module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    role: { type: DataTypes.ENUM("admin", "technician", "personal"), allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    profession: { 
      type: DataTypes.ENUM(
        "teacher",   
        "security", 
        "cleaning", 
        "student", 
        "researcher",
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
        "other"
      ), 
      allowNull: false 
    }, // Adjust values based on school roles
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }

);

  User.associate = (models) => {
    User.hasMany(models.request, { foreignKey: "requester_id" });
    User.hasMany(models.intervention, { foreignKey: "technician_id" });
    User.hasMany(models.notification, { foreignKey: "recipient_id" });
  };

  return User;
};
