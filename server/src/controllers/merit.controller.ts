import { FastifyRequest, FastifyReply } from 'fastify'
import { Merit } from '../modules/merit'
import { User } from "../entities/user"
import { Repository } from "typeorm"

interface TemplateReqBody extends FastifyRequest {
  query: any
}

export class MeritController {
  private readonly merit: Merit
  private readonly userRepository: Repository<User>
  constructor (m: Merit, u: Repository<User>) {
    this.merit = m
    this.userRepository = u
  }

  async getMeritTemplates (req: TemplateReqBody, reply: FastifyReply) {
    try {
      this.merit.orgId = req.user.orgId
      const api = await this.merit.getApiInstanceWithOrgTokenHeader()
      
      let rawTemplates = []
      let nextPageCursor = ''
      while (nextPageCursor !== null) {
        const res = await api.get(`/orgs/${req.user.orgId}/merittemplates?limit=200&${nextPageCursor ? 'starting_after=' + nextPageCursor : ''}`)
        rawTemplates = rawTemplates.concat(res.data.merittemplates)

        nextPageCursor = res.data.paging?.pageInfo?.hasNextPage ?
          res.data.paging.cursors.after :
          null
      }

      const templates = rawTemplates.map(({ id, title, orgId, enabledFieldSettings }) => ({ id, title, orgId, enabledFieldSettings }))

      reply
        .code(200)
        .send({ message: 'Success', data: { templates } })
    } catch(err) {
      console.log(err)
      reply.status(500).send({ error: 'Something went wrong!' })
    }
  }

  async getAllOrgFields (req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      this.merit.orgId = req.user.orgId
      const api = await this.merit.getApiInstanceWithOrgTokenHeader()

      const res = await api.get(`/orgs/${req.user.orgId}/fields?limit=200`)
      const fields = res.data.fields
        .filter(el => el.fieldType === 'ShortText' || el.fieldType === 'LongText')
        .map(({ id, fieldName, fieldType }) => ({ id, fieldName, fieldType }))

      reply
        .code(200)
        .send(fields)
    } catch (e) {
      reply
        .code(400)
        .send({ message: 'Error', details: e })
    }
  }
}
