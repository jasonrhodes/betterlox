import { TmdbCrew } from "../../lib/tmdb";
import { CrewRole } from "../entities";
import { getDataSource } from "../orm";

export const getCrewRepository = async () => (await getDataSource()).getRepository(CrewRole).extend({
  async createFromTmdb(movieId: number, role: TmdbCrew) {
    const created = this.create({
      movieId,
      personId: role.id,
      job: role.job,
      department: role.department,
      creditId: role.credit_id
    });
    return this.save(created);
  },

  async getCrewRolesWithMissingPeople(limit?: number) {
    const query = this.createQueryBuilder("crewRole")
      .leftJoinAndSelect("crewRole.person", "person")
      .select("crewRole.personId", "personId")
      .distinctOn(["crewRole.personId"])
      .where("person.name IS NULL")
      .andWhere("crewRole.personUnsyncable = false")
      .orderBy("crewRole.personId", "ASC")
      .limit(limit);
  
    const result = await query.getRawMany<{ personId: number }>();
    return result.map(({ personId }) => personId);
  }
});