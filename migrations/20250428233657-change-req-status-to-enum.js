'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove the old boolean column
    await queryInterface.removeColumn('requests', 'req_status');

    // 2. Create the new ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_requests_req_status AS ENUM ('reviewing', 'accepted', 'refused')
    `);

    // 3. Add the new column with ENUM
    await queryInterface.addColumn('requests', 'req_status', {
      type: 'enum_requests_req_status',
      allowNull: false,
      defaultValue: 'reviewing',
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverse: remove enum column and add boolean again
    await queryInterface.removeColumn('requests', 'req_status');
    
    await queryInterface.addColumn('requests', 'req_status', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // Drop the enum type to clean
    await queryInterface.sequelize.query(`
      DROP TYPE enum_requests_req_status
    `);
  }
};
