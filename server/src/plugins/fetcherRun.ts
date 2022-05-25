import { FastifyPluginOptions } from 'fastify' 

import { verifyUser } from '../modules/auth'
import { FetcherRunController } from '../controllers/fetcherRun.controller'

export default async (f: FastifyInstanceExtension, _: FastifyPluginOptions, next: any) => {
  const fetcherRun = new FetcherRunController(f.services.fetcherRun) 
  f
    .get('/orgs/:orgId/fetcherRuns', {
      preHandler: [verifyUser]
    }, fetcherRun.findAll.bind(fetcherRun))

    .get('/orgs/:orgId/fetcherRuns/:id', {
      preHandler: [verifyUser]
    }, fetcherRun.findOne.bind(fetcherRun))

  next()
}
