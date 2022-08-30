import { BetterloxApiError } from "../../lib/BetterloxApiError";
import { TmdbCrew } from "../../lib/tmdb";
import { CrewRole } from "../entities";
import { getDataSource } from "../orm";

export const getCrewRepository = async () => (await getDataSource()).getRepository(CrewRole).extend({
  async createFromTmdb(movieId: number, role: TmdbCrew) {
    try {
      const created = this.create({
        movieId,
        personId: role.id,
        job: role.job,
        department: role.department,
        creditId: role.credit_id
      });
      return await this.save(created);
    } catch (error: unknown) {
      const apiError = new BetterloxApiError(
        `Error creating cast entry for movie:${movieId}, person:${role.id}, job:${role.job}, creditId:${role.credit_id}`, 
        { error, statusCode: 500 }
      );

      if (apiError.originalError.message.includes('duplicate key value violates unique constraint')) {
        // do nothing
        // TODO log debug message here
      } else {
        throw apiError;
      }
    }
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