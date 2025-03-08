module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign keys only if they do not exist
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Interventions_technicienId_Users_fk'
        ) THEN
          ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_technicienId_Users_fk"
          FOREIGN KEY ("technicienId") REFERENCES "Users" ("id")
          ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Interventions_equipementId_Equipment_fk'
        ) THEN
          ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_equipementId_Equipment_fk"
          FOREIGN KEY ("equipementId") REFERENCES "Equipment" ("id")
          ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Notifications_utilisateurId_Users_fk'
        ) THEN
          ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_utilisateurId_Users_fk"
          FOREIGN KEY ("utilisateurId") REFERENCES "Users" ("id")
          ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Interventions', 'Interventions_technicienId_Users_fk');
    await queryInterface.removeConstraint('Interventions', 'Interventions_equipementId_Equipment_fk');
    await queryInterface.removeConstraint('Notifications', 'Notifications_utilisateurId_Users_fk');
  }
};