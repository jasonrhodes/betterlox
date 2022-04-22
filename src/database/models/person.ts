import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';
  
type IDataTypes = typeof DataTypes;

export interface PersonAttributes {
  name: string;
  biography?: string;
  birthday?: Date;
  deathday?: Date;
  gender?: number;
  imdbId?: number;
  knownForDepartment?: string;
  placeOfBirth?: string;
  popularity?: number;
  profilePath?: string;
}

export interface PersonInstance {
  id: number;
  name: string;
  biography: string | null;
  birthday: Date | null;
  deathday: Date | null;
  gender: number | null;
  imdbId: number | null;
  knownForDepartment: string | null;
  placeOfBirth: string | null;
  popularity: number | null;
  profilePath: string | null;
}

export const getPerson = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  var Person: ModelDefined<PersonInstance, PersonAttributes> = sequelize.define('person', {
    id: {
      type: DataTypes.NUMBER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    biography: DataTypes.TEXT,
    birthday: DataTypes.DATE,
    deathday: DataTypes.DATE,
    gender: DataTypes.NUMBER,
    imdbId: DataTypes.NUMBER,
    knownForDepartment: DataTypes.STRING,
    placeOfBirth: DataTypes.STRING,
    popularity: DataTypes.FLOAT,
    profilePath: DataTypes.STRING
  }, {
    tableName: 'people',
    underscored: true
  });

  Person.removeAttribute('createdAt');
  Person.removeAttribute('updatedAt');

  return Person;
};
