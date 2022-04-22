import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';
  
type IDataTypes = typeof DataTypes;

export interface GenreAttributes {
  name: string;
}

export interface GenreInstance {
  id: number;
  name: string;
}

export const getGenre = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  const Genre: ModelDefined<GenreInstance, GenreAttributes> = sequelize.define('genre', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'production_companies',
    underscored: true
  });

  Genre.removeAttribute('createdAt');
  Genre.removeAttribute('updatedAt');

  return Genre;
};
