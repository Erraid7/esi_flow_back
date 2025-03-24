module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define("equipment", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { 
      type: DataTypes.ENUM(
        "Lightweight", "Heavyweight", "Motorcycle", "Desktop", "Laptop", "Server", 
        "Router", "Switch", "Firewall", "Projector", "Printer", "Scanner", 
        "Oscilloscope", "3D Printer", "Desk", "Chair", "Window", "Door", 
        "Electromenager", "Heating", "Radiator", "Air Conditioner", "Other"
      ), 
      allowNull: false 
    },
    category: { 
      type: DataTypes.ENUM(
        "Vehicle", "Computing Device", "Networking Equipment", "Storage Device", 
        "Multimedia Equipment", "Office Equipment", "Laboratory Equipment", 
        "Furniture", "Building Component", "Appliance", "HVAC", "Other"
      ), 
      allowNull: false 
    },
    acquisition_date: { type: DataTypes.DATE },
    date_of_commissioning: { type: DataTypes.DATE },
    localisation: { type: DataTypes.STRING },
    eqp_status: { type: DataTypes.ENUM("working", "needs_maintenance", "out_of_service"), allowNull: false },
    documentation: { type: DataTypes.TEXT },
    maintenance_history: { type: DataTypes.ARRAY(DataTypes.INTEGER) }, // ✅ Array of intervention IDs
  },
  {
    underscored: true,
    tableName: "equipments", // This will define the table name explicitly
    timestamps: true,
  }

);

  Equipment.associate = (models) => {
    Equipment.hasMany(models.request, { foreignKey: "equipment_id" });
  };

  return Equipment;
};
