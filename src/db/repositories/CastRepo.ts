import { TmdbCast } from "../../lib/tmdb";
import { CastRole } from "../entities";
import { getDataSource } from "../orm";

export const getCastRepository = async () => (await getDataSource()).getRepository(CastRole).extend({
  async createFromTmdb(movieId: number, role: TmdbCast) {
    const created = this.create({
      movieId,
      personId: role.id,
      castId: role.cast_id,
      character: role.character,
      castOrder: role.order,
      creditId: role.credit_id
    });
    return this.save(created);
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