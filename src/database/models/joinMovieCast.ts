import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';
  
type IDataTypes = typeof DataTypes;

export interface MovieCastAttributes {
  movieId: number;
  personId: number;
  castId: number;
  character: string;
  castOrder: number;
  creditId: string;
}

export interface MovieCastInstance {
  movieId: number;
  personId: number;
  castId: number;
  character: string;
  castOrder: number;
  creditId: string;
}

export const getJoinMovieCast = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  const JoinMovieCast: ModelDefined<MovieCastInstance, MovieCastAttributes> = sequelize.define('joinMovieCast', {
    movieId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    personId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    castId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    character: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    castOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    creditId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'join_movies_cast',
    underscored: true
  });

  JoinMovieCast.removeAttribute('createdAt');
  JoinMovieCast.removeAttribute('updatedAt');

  return JoinMovieCast;
};
