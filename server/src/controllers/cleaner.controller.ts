import { ICleaner } from '../entities/cleaner'
import { CleanerService } from '../services/cleaner.service'
import { FastifyRequest, FastifyReply } from 'fastify'

interface CleanerReqBody extends FastifyRequest {
  body: ICleaner
  params: any
  query: any
}

export class CleanerController {
  private readonly cleanerService: CleanerService
  constructor(c: CleanerService) {
    this.cleanerService = c
  }

  async create(req: CleanerReqBody, reply: FastifyReply): Promise<void> {
    try {
      const cleaner = await this.cleanerService.create({ ...req.body, orgId: req.user.orgId })
      reply
        .code(200)
        .send(cleaner)
    } catch (e) {
      console.error(e);
      reply
        .code(400)
        .send({ message: 'Error', details: e.toString() })
    }
  }

  async update(req: CleanerReqBody, reply: FastifyReply): Promise<void> {
    try {
      await this.cleanerService.update(req.params.id, req.body)
      reply
        .code(200)
        .send({ message: "ok" })
    } catch (e) {
      console.error(e);
      reply
        .code(400)
        .send({ message: 'Error', details: e.toString })
    }
  }

  async findOne(req: CleanerReqBody, reply: FastifyReply): Promise<void> {
    try {
      const cleaner = await this.cleanerService.findOne(req.params.id)
      reply
        .code(200)
        .send(cleaner)
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findAll(req: CleanerReqBody, reply: FastifyReply): Promise<void> {
    try {
      const page: number = req.query.page || 1
      const limit: number = req.query.limit || 100
      const orgId: string = req.params.orgId

      const offset = (page - 1) * (limit + 1)

      const [cleaners, count] = await this.cleanerService.findAll(orgId, {
        skip: offset,
        take: limit > 100 ? 100 : limit
      })
      const totalPages = Math.ceil(count / limit)
      reply
        .code(200)
        .send({
          cleaners,
          totalPages,
          currentPage: page
        })
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async remove(req: CleanerReqBody, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.cleanerService.remove(req.params.id)
      reply
        .code(200)
        .send(result)
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }
}
