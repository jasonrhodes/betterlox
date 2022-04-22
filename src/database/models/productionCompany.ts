import {
  Sequelize,
  DataTypes,
  ModelDefined,
} from 'sequelize';
  
type IDataTypes = typeof DataTypes;

export interface ProductionCompanyAttributes {
  name: string;
  logoPath: string | null;
  originCountry: string | null;
}

export interface ProductionCompanyInstance {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry: string | null;
}

export const getProductionCompany = (sequelize: Sequelize, DataTypes: IDataTypes) => {
  const ProductionCompany: ModelDefined<ProductionCompanyInstance, ProductionCompanyAttributes> = sequelize.define('productionCompany', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    logoPath: DataTypes.TEXT,
    originCountry: DataTypes.STRING
  }, {
    tableName: 'production_companies',
    underscored: true
  });

  ProductionCompany.removeAttribute('createdAt');
  ProductionCompany.removeAttribute('updatedAt');

  return ProductionCompany;
};
