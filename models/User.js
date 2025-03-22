module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    role: { type: DataTypes.ENUM("admin", "technician", "personal"), allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    profession: { type: DataTypes.ENUM("teacher", "staff", "other"), allowNull: false }, // Adjust values based on school roles
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
