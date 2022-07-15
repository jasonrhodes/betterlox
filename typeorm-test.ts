import "reflect-metadata";
import { DataSource, Entity } from "typeorm";
import { Movie } from "./src/db/entities/Movie";

main();

async function main() {
  const dataSource = new DataSource({
    type: "sqlite",
    database: "./.db/movies.db",
    entities: [__dirname + '/src/db/entities/*.{js,ts}']
  });

  await dataSource.initialize();

  const movieRepo = dataSource.getRepository(Movie);
  const royalTenenbaums = await movieRepo.findOne({
    where: {
      id: 9428
    },
    relations: {
      genres: true,
      productionCompanies: true,
      cast: {
        actor: true
      },
      crew: {
        person: true
      }
    }
  });

  console.log(JSON.stringify(royalTenenbaums));
}