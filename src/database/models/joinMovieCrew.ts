import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';
  
type IDataTypes = typeof DataTypes;

export interface MovieCrewAttributes {
  movieId: number;
  personId: number;
  job: string;
  department: string;
  creditId: string;
}

export interface MovieCrewInstance {
  movieId: number;
  personId: number;
  job: string;
  department: string;
  creditId: string;
}

export const getJoinMovieCrew = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  const JoinMovieCrew: ModelDefined<MovieCrewInstance, MovieCrewAttributes> = sequelize.define('joinMovieCrew', {
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
    job: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creditId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'join_movies_crew',
    underscored: true
  });

  JoinMovieCrew.removeAttribute('createdAt');
  JoinMovieCrew.removeAttribute('updatedAt');

  return JoinMovieCrew;
};
