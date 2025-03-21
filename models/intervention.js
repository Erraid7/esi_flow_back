module.exports = (sequelize, DataTypes) => {
  const Intervention = sequelize.define("intervention", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    report: { type: DataTypes.TEXT, allowNull: false },
    technician_id: { type: DataTypes.INTEGER, allowNull: false },
    intv_status: { type: DataTypes.ENUM("planned", "in_progress", "completed", "cancelled"), allowNull: false },
    deadline: { type: DataTypes.DATE },
    date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    date_cloture: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    request_id: { type: DataTypes.INTEGER, allowNull: false },
    intervention_type: { type: DataTypes.ENUM("repair", "maintenance", "replacement"), allowNull: false },
  });

  Intervention.associate = (models) => {
    Intervention.belongsTo(models.user, { foreignKey: "technician_id" });
    Intervention.belongsTo(models.request, { foreignKey: "request_id" });
  };

  return Intervention;
};
