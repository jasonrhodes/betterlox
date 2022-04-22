import { Sequelize, DataTypes } from 'sequelize';
import { Environment, environments } from '../config/config';
import { getUser } from "./user";
import { getRating } from "./rating";
import { getMovie } from "./movie";
import { getPerson } from "./person";
import { getProductionCompany } from "./productionCompany";
import { getGenre } from "./genre";
import { getJoinMovieCast } from "./joinMovieCast";
import { getJoinMovieCrew } from "./joinMovieCrew";

function isValidEnvironment(env: string): env is Environment {
  return ["development", "test", "production"].includes(env);
}

const env = process.env.NODE_ENV || 'development';
if (!isValidEnvironment(env)) {
  throw new Error(`Invalid NODE_ENV set ${env}`);
}
const config = environments[env];

// export client
export const sequelize = new Sequelize(config);

// Export models
export const User = getUser(sequelize, DataTypes);
export const Rating = getRating(sequelize, DataTypes);
export const Movie = getMovie(sequelize, DataTypes);
export const Person = getPerson(sequelize, DataTypes);
export const ProductionCompany = getProductionCompany(sequelize, DataTypes);
export const Genre = getGenre(sequelize, DataTypes);

/**
 * Set up associations
 */

// Set up association join models
const JoinMovieCast = getJoinMovieCast(sequelize, DataTypes);
const JoinMovieCrew = getJoinMovieCrew(sequelize, DataTypes);

// Users have many ratings
User.hasMany(Rating, {
  foreignKey: 'user_id'
});
Rating.belongsTo(User, {
  foreignKey: 'user_id'
});

// Movies have many ratings
Movie.hasMany(Rating, {
  foreignKey: 'movie_id'
});
Rating.belongsTo(Movie, {
  foreignKey: 'movie_id'
});

// Movies have many cast members and vice-versa
Movie.belongsToMany(Person, { through: JoinMovieCast, as: "Cast" });
Person.belongsToMany(Movie, { through: JoinMovieCast, as: "moviesAsCast" });

// Movies have many crew members and vice-versa
Movie.belongsToMany(Person, { through: JoinMovieCrew, as: "Crew" });
Person.belongsToMany(Movie, { through: JoinMovieCrew, as: "MoviesAsCrew" });

// Movies have many production companies and vice-versa
Movie.belongsToMany(ProductionCompany, { through: 'join_movies_production_companies', as: "ProductionCompanies" });
ProductionCompany.belongsToMany(Movie, { through: 'join_movies_production_companies', as: "Movies" });

// Movies have many genres
Movie.hasMany(Genre);