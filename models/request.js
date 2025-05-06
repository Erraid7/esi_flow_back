module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define("request", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    requester_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    localisation: { type: DataTypes.STRING },
    equipment_id: { type: DataTypes.INTEGER },
    request_code: { type: DataTypes.STRING, allowNull: true }, // Step 1: Add this field
    priority: { type: DataTypes.ENUM("low", "medium", "high"), allowNull: false },
    req_status: { 
      type: DataTypes.ENUM("reviewing", "accepted", "refused"), 
      defaultValue: "reviewing",
      allowNull: false
    },
    
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    picture: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      afterCreate: async (request) => {
        const paddedId = String(request.id).padStart(5, "0");
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const eqPart = request.equipment_id || "000";
        const code = `REQ-${eqPart}-${datePart}-${paddedId}`;
  
        // Update the model instance
        request.request_code = code;
        await request.save();
      }
    }
  }

);

  Request.associate = (models) => {
    Request.belongsTo(models.user, { foreignKey: "requester_id", as: "requester" });
    Request.belongsTo(models.equipment, { foreignKey: "equipment_id", as: "equipment" });
    Request.hasMany(models.intervention, { foreignKey: "request_id" });
  };

  return Request;
};

