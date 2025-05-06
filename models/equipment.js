module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define("equipment", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    inventorie_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // ✅ NEW FIELD: Picture with default value
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "https://res.cloudinary.com/di1wbg7qo/image/upload/v1746015511/istockphoto-2173059563-612x612_ad0w9e.jpg"
    },

    // ✅ NEW FIELD: Automatic maintenance every X days
    automatic_maintenance_interval: {
      type: DataTypes.INTEGER, // in days (e.g., 90 means every 3 months)
      allowNull: true
    },

    // ✅ NEW FIELD: Maintenance in specific months (e.g., [1, 6, 12])
    seasonal_maintenance_months: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // months: 1 = Jan, ..., 12 = Dec
      allowNull: true
    },

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

    eqp_status: {
      type: DataTypes.ENUM("working", "needs_maintenance", "out_of_service"),
      allowNull: false
    },

    documentation: { type: DataTypes.TEXT },
    maintenance_history: { type: DataTypes.ARRAY(DataTypes.INTEGER) }
  },
  {
    underscored: true,
    tableName: "equipments",
    timestamps: true,
  });

  Equipment.associate = (models) => {
    Equipment.hasMany(models.request, { foreignKey: "equipment_id" });
  };

  return Equipment;
};
