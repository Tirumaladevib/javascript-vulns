import config from '../config'
import { FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { verifyUser } from '../modules/auth'

export default async (f: FastifyInstanceExtension, _: FastifyPluginOptions, next: any) => {
	const authController = new AuthController(
    f.modules.merit,
    f.db.user
  )

  f
    .get('/', (_, reply) => {
      reply.send('Merit Data Cleaning Tool API')
    })
    .get('/link-with-merit', authController.linkWithMerit.bind(authController))
    .get('/login-with-merit', authController.loginWithMerit.bind(authController))
    .get('/success', authController.success.bind(authController))
    .get('/me', {
      preHandler: [verifyUser]
    }, async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await f.db.user.findOne({ meritMemberId: req.user.userId, orgId: req.user.orgId })
        if (user) {
          reply.status(200).send(user)
        }
        reply.status(401).send('User does not exist')
      } catch (e) {
        reply.status(401).send('unauthorized')
      }
    })
    .get('/logout', (_, reply) => {
      reply
        .clearCookie(config.cookieName, { path: '/' })
        .status(200)
        .send('logged out successfully')
    })
  next()
}
