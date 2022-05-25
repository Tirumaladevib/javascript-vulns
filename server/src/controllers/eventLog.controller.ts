import { IEventLog } from '../entities/eventLog'
import { EventLogService } from '../services/eventLog.service'
import { FastifyRequest, FastifyReply } from 'fastify'

interface EventLogReqBody extends FastifyRequest {
  body: IEventLog
  params: any
  query: any
}

export class EventLogController {
  private readonly eventLogService: EventLogService
  constructor (c: EventLogService) {
    this.eventLogService = c
  }

  async findOne (req: EventLogReqBody, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.eventLogService.findOne(req.params.id)
      reply
        .code(200)
        .send({ message: 'Success', data: result })
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findAll (req: EventLogReqBody, reply: FastifyReply): Promise<void> {
    try {
      const page: number = req.query.page
      const limit: number = req.query.limit
      const orgId: string = req.params.orgId

      const offset = (page - 1) * (limit + 1)

      const [ eventLogs, count ] = await this.eventLogService.findAll(orgId, {
        skip: offset,
        take: limit > 100 ? 100 : limit
      })
      const totalPages = Math.ceil(count / limit)
      reply
        .code(200)
        .send({ message: 'Success', data: {
          eventLogs,
          totalPages,
          currentPage: page
        }})
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }
}
