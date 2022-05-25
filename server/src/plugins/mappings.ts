import { FastifyPluginOptions } from 'fastify' 

import { verifyUser } from '../modules/auth'
import { MappingController } from '../controllers/mapping.controller'

export default async (f: FastifyInstanceExtension, _: FastifyPluginOptions, next: any) => {
  const mapping = new MappingController(f.services.mapping, f.services.cleaner, f.services.fetcherState)
  f
    .get('/cleaners/:cleanerId/mappings', {
      preHandler: [verifyUser]
    }, mapping.findAll.bind(mapping))

    .get('/cleaners/:cleanerId/mappings/:id', {
      preHandler: [verifyUser]
    }, mapping.findOne.bind(mapping))

    .post('/cleaners/:cleanerId/mappings/:id', {
      preHandler: [verifyUser]
    }, mapping.save.bind(mapping))

  next()
}
