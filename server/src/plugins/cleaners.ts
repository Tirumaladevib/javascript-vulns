import { FastifyPluginOptions } from 'fastify' 

import { verifyUser } from '../modules/auth'
import { CleanerController } from '../controllers/cleaner.controller'

export default async (f: FastifyInstanceExtension, _: FastifyPluginOptions, next: any) => {
  const cleaner = new CleanerController(f.services.cleaner) 
  f
    .get('/orgs/:orgId/cleaners', {
      preHandler: [verifyUser]
    }, cleaner.findAll.bind(cleaner))

    .get('/orgs/:orgId/cleaners/:id', {
      preHandler: [verifyUser]
    }, cleaner.findOne.bind(cleaner))

    .post('/orgs/:orgId/cleaners', {
      preHandler: [verifyUser]
    }, cleaner.create.bind(cleaner))

    .patch('/orgs/:orgId/cleaners/:id', {
      preHandler: [verifyUser]
    }, cleaner.update.bind(cleaner))

    .delete('/orgs/:orgId/cleaners/:id', {
      preHandler: [verifyUser]
    }, cleaner.remove.bind(cleaner))

  next()
}
