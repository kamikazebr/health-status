// This is an example of to protect an API route
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("authOptions", authOptions);
  // process.env.NEXTAUTH_SECRET
  const session = await unstable_getServerSession(req, res, authOptions);
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: '/',
  //       permanent: false,
  //     },
  //   }
  // }

  console.log("session", session);
  if (session) {
    return res.send({
      content:
        "This is protected content. You can access this content because you are signed in.",
    });
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
}
