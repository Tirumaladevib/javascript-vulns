import config from '../config'
import { FastifyReply, FastifyRequest } from "fastify";
import logger from '../logger';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

type AuthParam = {
  userId: string;
  orgId: string;
}

export const setAuthCookies = async (reply: FastifyReply, userId: string, orgId: string): Promise<void> => {
  const token = await reply.jwtSign({ userId, orgId }, { expiresIn: ONE_DAY_IN_SECONDS * 2 });

  reply.setCookie(config.cookieName, token, {
    httpOnly: true,
    maxAge: ONE_DAY_IN_SECONDS * 2,
    path: '/',
    secure: process.env.NODE_ENV !== 'production',
    signed: true,
  });
}

export const verifyUser = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    await req.jwtVerify();

    await setAuthCookies(reply, req.user.userId, req.user.orgId);
  } catch (e) {
    logger.error(e)
    reply.status(401).send('unauthorized');
  }
}
