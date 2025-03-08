module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Interventions', {
      fields: ['technicienId'],
      type: 'foreign key',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    

    await queryInterface.addConstraint('Interventions', {
      fields: ['equipementId'],
      type: 'foreign key',
      references: {
        table: 'Equipment',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    

    await queryInterface.addConstraint('Notifications', {
      fields: ['utilisateurId'],
      type: 'foreign key',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Interventions', 'technicienId');
    await queryInterface.removeColumn('Interventions', 'equipementId');
    await queryInterface.removeColumn('Notifications', 'utilisateurId');
  }
};
