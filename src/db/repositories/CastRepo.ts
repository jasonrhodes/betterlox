import { BetterloxApiError } from "../../lib/BetterloxApiError";
import { TmdbCast } from "../../lib/tmdb";
import { CastRole } from "../entities";
import { getDataSource } from "../orm";

export const getCastRepository = async () => (await getDataSource()).getRepository(CastRole).extend({
  async createFromTmdb(movieId: number, role: TmdbCast) {
    try {
      const created = this.create({
        movieId,
        personId: role.id,
        castId: role.cast_id,
        character: role.character,
        castOrder: role.order,
        creditId: role.credit_id
      });
      return await this.save(created);
    } catch (error: unknown) {
      const apiError = new BetterloxApiError(
        `Error creating cast entry for movie:${movieId}, person:${role.id}, character:${role.character}, creditId:${role.credit_id}`, 
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
  async getCastRolesWithMissingPeople(limit?: number) {
    const query = this.createQueryBuilder("castRole")
      .leftJoinAndSelect("castRole.actor", "actor")
      .select("castRole.personId", "personId")
      .distinctOn(["castRole.personId"])
      .where("actor.name IS NULL")
      .andWhere("castRole.personUnsyncable = false")
      .orderBy("castRole.personId", "ASC")
      .limit(limit);
      
    const result = await query.getRawMany<{ personId: number }>();
    return result.map(({ personId }) => personId);
  }
});