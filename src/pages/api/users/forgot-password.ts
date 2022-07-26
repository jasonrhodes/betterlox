import { NextApiHandler } from "next";
import { getResetTokensRepository } from "../../../db/repositories";
import { getUserRepository } from "../../../db/repositories/UserRepo";
import { singleQueryParam } from "../../../lib/queryParams";
import { sendMail } from "../../../lib/sendMail";

function getAppUrl(path: string) {
  return `https://betterlox.herokuapp.com${path}`;
}

async function sendForgotPasswordEmail(email: string, token: string) {
  const url = getAppUrl(`/update-password?token=${token}`);
  return sendMail({
    to: email,
    subject: 'Betterlox | Reset Password',
    text: `Somebody just attempted to reset your Betterlox password. If it wasn't you, you can ignore this. Otherwise, visit ${url} to update your password. This link will expire in one hour.`,
    html: `<body>
<div style="max-width: 800px">
<h1>Reset Your Password</h1>
<p>Somebody just attempted to reset your Betterlox password. If it wasn't you, you can ignore this. Otherwise, visit <a href="${url}">your custom reset page</a> to update your password. This link will expire in one hour.</p>
<p>If that link doesn't work for some reason, copy and paste this into your browser: ${url}</p>
</div>
    </body>`
  });
}

const ForgotPasswordRoute: NextApiHandler = async (req, res) => {
  const email = singleQueryParam(req.body.email);

  if (!email) {
    return res.status(400).json({ message: 'Must provide email' });
  }

  const UserRepo = await getUserRepository();
  const ResetTokensRepo = await getResetTokensRepository();
  
  // if we make it this far, we must have an email and we are sending the reset email
  const user = await UserRepo.findOneBy({ email });

  if (!user) {
    return res.status(200).json({});
  }

  // create/store/retrieve new token
  const { token } = await ResetTokensRepo.generateForUser(user);

  try {
    await sendForgotPasswordEmail(user.email, token);
    console.log("Reset password email sent");
    res.status(200).json({});
  } catch (error) {
    let message = "Unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    console.log("Problem occurred while attempting to send reset email", message);
    res.status(500).json({ message });
  }
}

export default ForgotPasswordRoute;