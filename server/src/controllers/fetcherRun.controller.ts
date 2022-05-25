import { IFetcherRun } from '../entities/fetcherRun'
import { FetcherRunService } from '../services/fetcherRun.service'
import { FastifyRequest, FastifyReply } from 'fastify'

interface FetcherRunReqBody extends FastifyRequest {
  body: IFetcherRun
  params: any
  query: any
}

export class FetcherRunController {
  private readonly fetcherRunService: FetcherRunService
  constructor (c: FetcherRunService) {
    this.fetcherRunService = c
  }

  async save (req: FetcherRunReqBody, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.fetcherRunService.save(req.body)
      reply
        .code(200)
        .send({ message: 'Success', data: result })
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findOne (req: FetcherRunReqBody, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.fetcherRunService.findOne(req.params.id)
      reply
        .code(200)
        .send({ message: 'Success', data: result })
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findAll (req: FetcherRunReqBody, reply: FastifyReply): Promise<void> {
    try {
      const page: number = req.query.page
      const limit: number = req.query.limit
      const orgId: string = req.params.orgId

      const offset = (page - 1) * (limit + 1)

      const [ fetcherRuns, count ] = await this.fetcherRunService.findAll(orgId, {
        skip: offset,
        take: limit > 100 ? 100 : limit
      })
      const totalPages = Math.ceil(count / limit)
      reply
        .code(200)
        .send({ message: 'Success', data: {
          fetcherRuns,
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
