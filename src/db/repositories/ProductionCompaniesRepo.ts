import { TmdbProductionCompany } from "../../lib/tmdb";
import { ProductionCompany } from "../entities";
import { getDataSource } from "../orm";

export const getProductionCompaniesRepository = async () => (await getDataSource()).getRepository(ProductionCompany).extend({
  createFromTmdb(company: TmdbProductionCompany) {
    const created = this.create({
      id: company.id,
      name: company.name,
      logoPath: company.logo_path,
      originCountry: company.origin_country
    });

    return this.save(created);
  }
});