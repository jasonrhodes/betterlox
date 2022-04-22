import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';

type IDataTypes = typeof DataTypes;

export interface UserAttributes {
  email?: string;
  password?: string;
  salt?: string;
  rememberMeToken?: string;
  letterboxdUsername?: string;
  letterboxdAccountLevel?: string;
  letterboxdName?: string;
  avatarUrl?: string;
}

export interface UserInstance {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  password: string;
  salt: string;
  rememberMeToken: string;
  letterboxdUsername: string;
  letterboxdAccountLevel: string;
  letterboxdName: string;
  avatarUrl: string;
}

export const getUser = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  const User: ModelDefined<UserAttributes, UserAttributes> = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rememberMeToken: DataTypes.STRING,
      letterboxdUsername: {
        type: DataTypes.STRING,
        allowNull: false
      },
      letterboxdAccountLevel: DataTypes.STRING,
      letterboxdName: DataTypes.STRING,
      avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: 'users'
    }
  );

  // User.associate = function(models) {
  //   // associations can be defined here
  // };

  return User;
};
