import config from '../config'
import { FastifyRequest, FastifyReply, RequestGenericInterface } from 'fastify'
import { Merit } from '../modules/merit'
import { User } from "../entities/user"
import { Repository } from "typeorm"
import { MeritMember } from "../types/merit"
import { setAuthCookies } from '../modules/auth'

interface RequestParam extends RequestGenericInterface {
  Querystring: {
    state: string
    memberIdToken: string
    orgIdToken: string
    meritMemberId: string
  }
}

export class AuthController {
  private readonly merit: Merit
  private readonly userRepository: Repository<User>
  constructor (m: Merit, u: Repository<User>) {
    this.merit = m
    this.userRepository = u
  }

  async loginWithMerit (req: FastifyRequest<RequestParam>, reply: FastifyReply): Promise<void> {
    try {
      const orgId = config.appOrgId
      const state: string = req.query.state

      const postData = {
        requestedPermissions: [
          { permissionType: 'CanViewPublicProfile' },
          { permissionType: 'CanViewAllStandardMerits' }
        ],
        successUrl: '/success',
        failureUrl: '/failure',
        state
      }

      this.merit.orgId = orgId
      const api = await this.merit.getApiInstanceWithOrgTokenHeader()
      const res: any = await api.post(`/orgs/${orgId}/request_loginwithmerit_url`, postData)
      reply.send({ redirectURL: res.data.request_loginwithmerit_url })
    } catch (e) {
      reply.status(401).send({ error: 'Failed Authentication!' })
    }
  }

  async linkWithMerit (req: FastifyRequest<RequestParam>, reply: FastifyReply): Promise<void> {
    try {
      const state: string = req.query.state
      const orgId = config.appOrgId

      const postData = {
        requestedPermissions: [
          { permissionType: 'CanManageOrg' }
        ],
        successUrl: '/success',
        failureUrl: '/failure',
        state
      }

      this.merit.orgId = orgId
      const api = this.merit.getApiInstance()
      const link: any = await api.post('/request_linkapp_url', postData)
      reply.send({ redirectURL: link.data.request_linkapp_url })
    } catch (e) {
      reply.status(401).send({ error: 'Failed Authentication!' })
    }
  }

  async success (req: FastifyRequest<RequestParam>, reply: FastifyReply): Promise<void> {
    try {
      if (req.query.memberIdToken) {
        const api = await this.merit.getApiInstanceWithOrgTokenHeader()
        const res: any = await api.get(`/member_id?member_id_token=${req.query.memberIdToken}`)
        const memberId: string = res.data.memberId
        reply.send({ meritMemberId: memberId })
      }

      if (req.query.orgIdToken) {
        this.merit.orgId = config.appOrgId
        const api = this.merit.getApiInstance()
        const res = await api.get(`/org_id?org_id_token=${req.query.orgIdToken}`)
        const orgId: string = res.data.orgId

        if (orgId) {
          this.merit.orgId = orgId
          const { meritMemberId } = req.query
          const api = await this.merit.getApiInstanceWithOrgTokenHeader()
          const res = await api.get(`/orgs/${orgId}`)

          this.merit.orgId = config.appOrgId
          const applicationHttpClient = await this.merit.getApiInstanceWithOrgTokenHeader()
          const memberDetailsRes = await applicationHttpClient.get<MeritMember>(`/members/${meritMemberId}`)
          const { firstName, lastName } = memberDetailsRes.data.name

          const user = await this.userRepository.findOne({ meritMemberId, orgId })

          await setAuthCookies(reply, meritMemberId, orgId)

          if (!user) {
            const newUser = await this.userRepository.save({
              meritMemberId,
              name: `${firstName} ${lastName}`,
              orgId,
              orgTitle: res.data.title,
            })
            return reply.send(newUser)
          }

          return reply.send(user)
        }
        reply.status(401).send({ error: 'Auth error!' })
      }
    } catch (e) {
      reply.status(500).send({ error: 'Internal Server Error' })
    }
  }
}
