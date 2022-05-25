import { FastifyPluginOptions } from 'fastify' 
import { verifyUser } from '../modules/auth'
import { FetcherStateController } from '../controllers/fetcherState.controller'

export default async (f: FastifyInstanceExtension, _: FastifyPluginOptions, next: any) => {
  const fetcherState = new FetcherStateController(f.services.fetcherState) 
  f
    .get('/orgs/:orgId/fetcherStates', {
      preHandler: [verifyUser]
    }, fetcherState.findAll.bind(fetcherState))

    .get('/orgs/:orgId/fetcherStates/:id', {
      preHandler: [verifyUser]
    }, fetcherState.findOne.bind(fetcherState))

  next()
}
