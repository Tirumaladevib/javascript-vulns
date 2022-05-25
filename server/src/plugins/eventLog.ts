import { FastifyPluginOptions } from 'fastify' 
import { verifyUser } from '../modules/auth'
import { EventLogController } from '../controllers/eventLog.controller'

export default async (f: FastifyInstanceExtension, _: FastifyPluginOptions, next: any) => {
  const eventLog = new EventLogController(f.services.eventLog) 
  f
    .get('/orgs/:orgId/eventLogs', {
      preHandler: [verifyUser]
    }, eventLog.findAll.bind(eventLog))

    .get('/orgs/:orgId/eventLogs/:id', {
      preHandler: [verifyUser]
    }, eventLog.findOne.bind(eventLog))

  next()
}
