import { Mapping } from '../entities/mapping'
import { MeritsPageFetcher } from '../modules/PageFetcher'
import { ValuesCheckpoint } from '../modules/PageFetcher/ValuesCheckpoint'
import logger from '../logger'

export class UniqueValuesCoordinator {
  private orgId: string
  private cleaners: any
  private worker: any
  private services: any
  private fieldsOfInterest: string[]

  private constructor(orgId: string, cleaners: any[], orgFields: any[], services: any) {
    this.orgId = orgId
    this.cleaners = cleaners
    this.worker = { add: services.addJobToQueue }
    this.services = services

    const longAndShortTextFields =
      orgFields
        .filter(el => el.fieldType === 'ShortText' || el.fieldType === 'LongText')
        .map(el => el.id)

    this.fieldsOfInterest = longAndShortTextFields
  }

  static async create(orgId: string, services: any) {
    logger.info(`Create UniqueValuesCoordinator for org: ${orgId}`)

    const [orgFieldsResponse, cleanersResponse] = await Promise.all([
      services.getOrgFields(orgId),
      services.getOrgCleaners(orgId)
    ])

    const orgFields = orgFieldsResponse.fields
    const cleaners = cleanersResponse[0]

    return new UniqueValuesCoordinator(orgId, cleaners, orgFields, services)
  }

  isFieldOfInterest(field: any) {
    return this.fieldsOfInterest.includes(field.fieldId)
  }

  async processMerits(merits: any[]) {
    try {
      const mappings = []

      const allFieldValues =
        merits
          .map(el => el.fieldValues)
          .reduce((acc, val) => acc.concat(val), []) // flat() has some typescript problem
          .filter(this.isFieldOfInterest)

      for (const fieldValue of allFieldValues) {
        const cleaner = this.cleaners.find(el => el.fieldId === fieldValue.fieldId)
        const mapping = new Mapping()
        mapping.cleanerId = cleaner.id
        mapping.inputValue = fieldValue.value
        mapping.outputValue = ''

        mappings.push()
      }

      await this.worker.saveMappings(mappings)
    } catch (err) {
      logger.error(`Error processing merits: ${merits[0].id}`)
      logger.error(err)
    }
  }

  async processMeritTemplate(meritTemplateId: string) {
    logger.info(`Processing merit template (extract all values from merits): ${meritTemplateId}`)

    try {
      let checkpoint = await ValuesCheckpoint.load(this.orgId, meritTemplateId, this.services)
      if (checkpoint === null) checkpoint = await ValuesCheckpoint.initialize(this.orgId, meritTemplateId, '', this.services)
      const pageFetcher = new MeritsPageFetcher(this.orgId, meritTemplateId, checkpoint, { getMeritsOnCursor: this.services.getMeritsOnCursor })

      while (pageFetcher.hasNextPage()) {
        const merits = await pageFetcher.getNextPage()
        if (!merits.length) break

        await this.processMerits(merits)

        await pageFetcher.updateCheckpoint()
      }
    } catch (err) {
      logger.error(`Error processing merit template: ${meritTemplateId}`)
      logger.error(err)
    }
  }

  async start() {
    logger.info('Starting unique values extraction for all merit templates...')

    const meritTemplateIds = await this.services.getAllMeritTemplates(this.orgId)
    for (const meritTemplateId of meritTemplateIds) {
      await this.processMeritTemplate(meritTemplateId)
    }

    logger.info('Done')
  }
}
