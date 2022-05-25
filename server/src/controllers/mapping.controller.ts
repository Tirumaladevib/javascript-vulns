import { IMapping } from '../entities/mapping'
import { MappingService } from '../services/mapping.service'
import { FastifyRequest, FastifyReply } from 'fastify'
import { FetcherStateService } from '../services/fetcherState.service'
import { CleanerService } from '../services/cleaner.service'
import { sentry } from '../sentry'

interface MappingReqBody extends FastifyRequest {
  body: IMapping
  params: any
  query: any
}

export class MappingController {
  private readonly mappingService: MappingService
  private readonly fetcherStateService: FetcherStateService
  private readonly cleanerService: CleanerService

  constructor (c: MappingService, cs: CleanerService, fs: FetcherStateService) {
    this.mappingService = c
    this.cleanerService = cs
    this.fetcherStateService = fs
  }

  async save (req: MappingReqBody, reply: FastifyReply): Promise<void> {
    try {
      const orgId = req.user.orgId
      const cleanerId = req.body.cleanerId

      const cleaner = await this.cleanerService.findOne({ orgId, id: cleanerId })
      const meritTemplateIds =
        cleaner.meritTemplates
          .filter(el => el.active)
          .map(el => el.id)

      const mapping = await this.mappingService.save([req.body])

      const promises = []
      for (const meritTemplateId of meritTemplateIds) {
        promises.push(this.fetcherStateService.remove({ orgId, meritTemplateId, type: 'merits' }))
      }
      await Promise.all(promises)

      reply
        .code(200)
        .send({ message: 'Success', mapping })
    } catch (e) {
      sentry.captureException(e)
      console.log(e)
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findOne (req: MappingReqBody, reply: FastifyReply): Promise<void> {
    try {
      const mapping = await this.mappingService.findOne(req.params.cleanerId, req.params.id)
      if (mapping) {
        return reply
          .code(200)
          .send(mapping)
      } else {
        return reply
          .code(400)
      }
    } catch (e) {
      sentry.captureException(e)
      console.log(e)
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }

  async findAll (req: MappingReqBody, reply: FastifyReply): Promise<void> {
    try {
      const page: number = parseInt(req.query.page) || 1
      const limit: number = req.query.limit || 100
      const searchTerm: string = req.query.searchTerm
      const cleanerId: string = req.params.cleanerId

      const offset = (page - 1) * limit

      const findOptions = {
        skip: offset,
        take: limit > 100 ? 100 : limit
      }

      let mappings: IMapping[], count: number
      if (searchTerm) {
        [mappings, count] = await this.mappingService.searchAll(cleanerId, searchTerm, findOptions)
      } else {
        [mappings, count] = await this.mappingService.findAll(cleanerId, findOptions)
      }

      const totalPages = Math.ceil(count / limit)
      reply
        .code(200)
        .send({
          mappings,
          totalPages,
          currentPage: page
        })
    } catch (e) {
      sentry.captureException(e)
      console.log(e)
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }
}
