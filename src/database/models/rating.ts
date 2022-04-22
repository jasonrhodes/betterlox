import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';
  
type IDataTypes = typeof DataTypes;

export interface RatingAttributes {
  user_id?: number
  movie_id?: number
  rating?: number;
  date?: Date;
  name?: string;
}

export interface RatingInstance {
  user_id: number
  movie_id: number
  rating: number;
  date: Date;
  name: string;
}

export const getRating = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  var Rating: ModelDefined<RatingInstance, RatingAttributes> = sequelize.define('rating', {
    user_id: {
      type: DataTypes.NUMBER,
      allowNull: false,
      primaryKey: true
    },
    movie_id: {
      type: DataTypes.NUMBER,
      allowNull: false,
      primaryKey: true
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    date: DataTypes.DATE,
    name: DataTypes.STRING
  }, {
    tableName: 'ratings'
  });

  Rating.removeAttribute('id');
  Rating.removeAttribute('createdAt');
  Rating.removeAttribute('updatedAt');

  return Rating;
};
