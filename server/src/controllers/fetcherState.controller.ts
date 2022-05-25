import { IFetcherState } from '../entities/fetcherState'
import { FetcherStateService } from '../services/fetcherState.service'
import { FastifyRequest, FastifyReply } from 'fastify'

interface FetcherStateReqBody extends FastifyRequest {
  body: IFetcherState[]
  params: any
  query: any
}

export class FetcherStateController {
  private readonly fetcherStateService: FetcherStateService
  constructor (f: FetcherStateService) {
    this.fetcherStateService = f
  }

  async save (req: FetcherStateReqBody, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.fetcherStateService.save(req.body)
      reply
        .code(200)
        .send({ message: 'Success', data: result })
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findOne (req: FetcherStateReqBody, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.fetcherStateService.findOne(req.params.id)
      reply
        .code(200)
        .send({ message: 'Success', data: result })
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findAll (req: FetcherStateReqBody, reply: FastifyReply): Promise<void> {
    try {
      const page: number = req.query.page
      const limit: number = req.query.limit
      const orgId: string = req.params.orgId

      const offset = (page - 1) * (limit + 1)

      const [ fetcherStates, count ] = await this.fetcherStateService.findAll(orgId, {
        skip: offset,
        take: limit > 100 ? 100 : limit
      })
      const totalPages = Math.ceil(count / limit)
      reply
        .code(200)
        .send({ message: 'Success', data: {
          fetcherStates,
          totalPages,
          currentPage: page
        }})
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async remove (req: FetcherStateReqBody, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.fetcherStateService.remove(req.params.id)
      reply
        .code(200)
        .send({ message: 'Success', data: result })
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }
}
