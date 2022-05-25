import config from '../config'
import validator from 'validator'
import axiosRetry from 'axios-retry'
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import { ExcludedMeritStatuses } from '../constants/meritStatus'
import { FetcherStateService } from '../services/fetcherState.service'
import { Template, IMerit } from '../types/merit'
import { createTokenService } from '../services/token.service'
import logger from '../logger'

axiosRetry(Axios, { retries: 3 })

export class Merit {
  public orgId: string
  private readonly appId: string
  private readonly appSecret: string
  private readonly baseURL: string
  public fetcherStateService: FetcherStateService
  private api: AxiosInstance
  constructor(f?: FetcherStateService) {
    this.fetcherStateService = f
    this.appId = config.appId
    this.appSecret = config.appSecret
    this.baseURL = config.meritBaseUrl
    this.api = Axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.appId,
        password: this.appSecret
      }
    })
  }

  getApiInstance() {
    return this.api
  }

  async getApiInstanceWithOrgTokenHeader(timeout: number = 20000) {
    const accessToken: string = await this.getOrgAccessToken()
    return Axios.create({
      baseURL: this.baseURL,
      timeout,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async getOrgAccessToken(): Promise<string> {
    const { createOrUpdateToken, getToken } = await createTokenService()
    const token = await getToken(this.orgId)
    if (token) return token.orgAccessToken

    const res = await this.api.post<{ orgAccessToken: string }>(`/orgs/${this.orgId}/access`)
    const { orgAccessToken } = res.data

    await createOrUpdateToken({
      orgId: this.orgId,
      orgAccessToken,
    })
    return orgAccessToken
  }

  async get(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    const res: AxiosResponse = await this.api.get(url, config)
    return res
  }

  async post(url: string, data: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    const res: AxiosResponse = await this.api.post(url, data, config)
    return res
  }

  async getOrgFields(): Promise<any> {
    try {
      logger.info(`Get org fields from Merit API for org: ${this.orgId}`)

      const res = await this.get(`/orgs/${this.orgId}/fields`)
      const fields = res.data.fields.filter((field: any) => field.fieldType === 'ShortText' || field.fieldType === 'LongText')

      return fields
    } catch (err) {
      //@TODO: add logger here
      logger.error(err)
      return []
    }
  }

  async getAllMeritTemplates(): Promise<Template[]> {
    let mt: any[] = await this.getMeritTemplatesHelper(this.orgId)
    let fields: any = await this.getOrgFields()

    let merittemplates = mt.filter((merit) => {
      return merit.archived === false
    })

    merittemplates.forEach((value, key) => {
      value.enabledFieldSettings.forEach((field, fieldKey) => {
        field.name = fields.find(f => {
          if (f.id === field.fieldId) return field.fieldName
        })
        field.details = fields.find(f => f.id === field.fieldId)
      })
    })

    return merittemplates
  }

  async getMeritTemplate(
    meritTemplateId: string
  ): Promise<Template | null> {
    try {
      logger.info(`Get Merit Template details from Merit API: ${meritTemplateId}`)

      const res = await this.get(`/merittemplates/${meritTemplateId}`)
      const mt = res.data
      let fields = await this.getOrgFields()
      mt.enabledFieldSettings.forEach((field, fieldKey) => {
        let fieldDetails = fields.find(f => f.id === field.fieldId)
        field.name = fieldDetails.fieldName
        field.details = fieldDetails
      })

      return mt
    } catch (error) {
      //@TODO: Add logger logic here
      logger.error(error)
      return undefined
    }
  }

  async getMeritsByEmail(email: string, meritTemplateId: string = null, includeRevoke: boolean = false): Promise<IMerit[] | []> {
    if (!validator.isEmail(email)) {
      throw new Error(`Invalid email: ${email}`)
    }

    const merits: IMerit[] = await this.getMeritsByEmailHelper(email, meritTemplateId)
    return merits.filter((merit: any) => {
      if (includeRevoke) return true

      return !ExcludedMeritStatuses.includes(merit.status)
    })
  }

  async getMeritsByEmailHelper(email: string, meritTemplateId: string = null, after: string = null): Promise<IMerit[] | []> {
    let params: any = {
      recipient_email: email,
      limit: 10
    }

    if (after) params.starting_after = after
    if (meritTemplateId) params.merittemplate_id = meritTemplateId

    let merits: IMerit[] = []

    logger.info(`Get Merits by email from Merit API with params: ${JSON.stringify(params)}`)
    let res = await this.get(`/orgs/${this.orgId}/merits`, { params })

    if (res.data.merits.length) {
      merits = merits.concat(res.data.merits)
    }

    if (res.data.paging && res.data.paging.cursors) {
      const nextMerits: IMerit[] = await this.getMeritsByEmailHelper(email, meritTemplateId, res.data.paging.cursors.after)
      if (nextMerits.length) {
        merits = merits.concat(nextMerits)
      }
    }

    return merits
  }

  private async getMeritTemplatesHelper(after = null): Promise<Template[] | []> {
    logger.info(`Get Merit Templates from Merit API for org: ${this.orgId}`)

    let url = `/orgs/${this.orgId}/merittemplates?limit=200`
    if (after) {
      url += `&starting_after=${after}`
    }

    let meritTemplates = []
    const mtResponse = await this.get(url, { timeout: 30000 })
    if (mtResponse.data.merittemplates.length) {
      meritTemplates = meritTemplates.concat(mtResponse.data.merittemplates)
    }

    if (mtResponse.data.paging && mtResponse.data.paging.cursors && mtResponse.data.paging.pageInfo.hasNextPage) {
      const nextMt = await this.getMeritTemplatesHelper(mtResponse.data.paging.cursors.after)
      if (nextMt.length) {
        meritTemplates = meritTemplates.concat(nextMt)
      }
    }

    return meritTemplates
  }
}
