import { FastifyPluginOptions } from 'fastify'
import { MeritController } from '../controllers/merit.controller'
import { verifyUser } from '../modules/auth'

export default async (f: FastifyInstanceExtension, _: FastifyPluginOptions, next: any) => {
	const meritController = new MeritController(
    f.modules.merit,
    f.db.user
  )

  f
    .get('/merit-templates', {
      preHandler: [verifyUser]
    }, meritController.getMeritTemplates.bind(meritController))

    .get('/fields', {
      preHandler: [verifyUser]
    }, meritController.getAllOrgFields.bind(meritController))

  next()
}
