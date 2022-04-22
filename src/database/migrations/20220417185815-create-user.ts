import {
  QueryInterface,
  SequelizeStatic
} from 'sequelize';

export = {
  up: (queryInterface: QueryInterface, Sequelize: SequelizeStatic) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      email: {
        type: Sequelize.STRING
      },

      password: {
        type: Sequelize.STRING
      },

      salt: {
        type: Sequelize.STRING
      },

      rememberMeToken: {
        type: Sequelize.STRING
      },

      letterboxdUsername: {
        type: Sequelize.STRING
      },

      letterboxdAccountLevel: {
        type: Sequelize.STRING
      },

      letterboxdName: {
        type: Sequelize.STRING
      },

      avatarUrl: {
        type: Sequelize.TEXT
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: SequelizeStatic) => {
    return queryInterface.dropTable('Users');
  }
};
