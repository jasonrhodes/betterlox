import { NextApiHandler } from "next";
import { getResetTokensRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories/UserRepo";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";

const ResetPasswordRoute: NextApiHandler = async (req, res) => {
  const token = singleQueryParam(req.body.token);
  const updatedPassword = singleQueryParam(req.body.updatedPassword);

  if (!token || !updatedPassword) {
    return res.status(400).json({ message: 'Missing token or updatedPassword values' });
  }

  const UserRepo = await getUserRepository();
  const ResetTokensRepo = await getResetTokensRepository();

  // verify token, update password
  await ResetTokensRepo.clearExpired();
  const retrieved = await ResetTokensRepo.findOne({ 
    where: { token },
    relations: { user: true }
  });
  if (!retrieved) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  retrieved.user.password = updatedPassword;
  retrieved.user.hashUserPassword();
  await UserRepo.save(retrieved.user);
  return res.status(200).json({});
}

export default ResetPasswordRoute;