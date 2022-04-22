import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';
  
type IDataTypes = typeof DataTypes;

export interface MovieAttributes {
  backdropPath: string;
  imdbId: number;
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  posterPath: string;
  popularity: number;
  runtime: number;
  releaseDate: Date;
  title: string;
}

export interface MovieInstance {
  id: number;
  backdropPath: string;
  imdbId: number;
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  posterPath: string;
  popularity: number;
  runtime: number;
  releaseDate: Date;
  title: string;
}

export const getMovie = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  var Movie: ModelDefined<MovieInstance, MovieAttributes> = sequelize.define('movie', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    backdropPath: DataTypes.STRING,
    imdbId: DataTypes.INTEGER,
    originalLanguage: DataTypes.STRING,
    originalTitle: DataTypes.STRING,
    overview: DataTypes.STRING,
    posterPath: DataTypes.STRING,
    popularity: DataTypes.FLOAT,
    runtime: DataTypes.INTEGER
  }, {
    tableName: 'movies',
    underscored: true
  });

  Movie.removeAttribute('createdAt');
  Movie.removeAttribute('updatedAt');

  return Movie;
};
