import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../dataSource/onSportSource.js';
import { User } from './User.js';

export class Location extends Model {}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    tableName: 'location',
    sequelize,
    modelName: 'Location',
    createdAt: false,
    updatedAt: false,
  },
);

// Location.hasMany(User);
