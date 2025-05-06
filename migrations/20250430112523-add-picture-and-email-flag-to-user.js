'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'pictures', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'npx sequelize-cli migration:generate --name add-picture-and-email-flag-to-user' // Replace with your default image
    });

    await queryInterface.addColumn('users', 'wants_email_notifications', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'picture');
    await queryInterface.removeColumn('users', 'wants_email_notifications');
  }
};
