import {
  QueryInterface,
  SequelizeStatic
} from 'sequelize';

export = {
  up: (queryInterface: QueryInterface, Sequelize: SequelizeStatic) => {
    return queryInterface.createTable('ratings', {
      user_id: {
        type: Sequelize.NUMBER,
        allowNull: false,
        primaryKey: true
      },

      movie_id: {
        type: Sequelize.NUMBER,
        allowNull: false,
        primaryKey: true
      },

      rating: {
        type: Sequelize.FLOAT,
        allowNull: false
      },

      date: {
        type: Sequelize.DATE
      },

      name: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('ratings');
  }
};
