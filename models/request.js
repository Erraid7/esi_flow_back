module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define("request", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    requester_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    localisation: { type: DataTypes.STRING },
    equipment_id: { type: DataTypes.INTEGER },
    priority: { type: DataTypes.ENUM("low", "medium", "high"), allowNull: false },
    req_status: { type: DataTypes.ENUM("To Do", "In Progress", "Pending", "Completed"), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    picture: { type: DataTypes.TEXT },
  });

  Request.associate = (models) => {
    Request.belongsTo(models.user, { foreignKey: "requester_id" });
    Request.belongsTo(models.equipment, { foreignKey: "equipment_id" });
    Request.hasMany(models.intervention, { foreignKey: "request_id" });
  };

  return Request;
};
