import { NextApiHandler } from "next";
import { getResetTokensRepository } from "../../../db/repositories";
import { getUserRepository } from "../../../db/repositories/UserRepo";
import { singleQueryParam } from "../../../lib/queryParams";

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
  await UserRepo.save(retrieved.user);
  return res.status(200).json({});
}

export default ResetPasswordRoute;