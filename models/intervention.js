module.exports = (sequelize, DataTypes) => {
  const Intervention = sequelize.define("intervention", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    report: { type: DataTypes.TEXT, allowNull: false },
    technician_id: { type: DataTypes.INTEGER, allowNull: false },
    intv_status: { type: DataTypes.ENUM("To Do", "In Progress", "Pendding", "completed", "cancelled"), allowNull: false },
    deadline: { type: DataTypes.DATE },
    date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    date_cloture: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    request_id: { type: DataTypes.INTEGER, allowNull: false },
    intervention_type: { type: DataTypes.ENUM("repair", "maintenance", "replacement"), allowNull: false },
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: "date_creation",
    updatedAt: "updated_at",
  }

);

  Intervention.associate = (models) => {
    Intervention.belongsTo(models.user, { foreignKey: "technician_id", as: "technician" });
    Intervention.belongsTo(models.request, { foreignKey: "request_id", as: "request" });
  };

  return Intervention;
};
