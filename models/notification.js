module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("notification", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    recipient_id: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM("Info", "Warning", "Error", "Success"), allowNull: false },
    request_id: { type: DataTypes.INTEGER },
    intervention_id: { type: DataTypes.INTEGER },
    delivery_method: { type: DataTypes.ENUM("email", "sms", "app_notification"), allowNull: false },
    seen: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: "created_at"
  }

);

  Notification.associate = (models) => {
    Notification.belongsTo(models.user, { foreignKey: "recipient_id", as: "recipient" });
    Notification.belongsTo(models.request, { foreignKey: "request_id", as: "request" });
    Notification.belongsTo(models.intervention, { foreignKey: "intervention_id", as: "intervention" });
  };

  return Notification;
};
