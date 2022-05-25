import { ICleaner } from '../entities/cleaner'
import { MeritsPageFetcher, MeritsCheckpoint } from '../modules/PageFetcher'
import { SimpleTransformer } from '../modules/Transformer'
import { sentry } from '../sentry'
import { IMerit, JobData } from '../types/merit'
import logger from '../logger'
import { NonEditableStatuses } from '../constants/meritStatus'

export class NewMeritsCoordinator {
  private orgId: string
  private cleaners: ICleaner[]
  private orgFields: any
  private jobScheduler: any
  private transformer: SimpleTransformer
  private services: any

  private constructor(orgId: string, cleaners: ICleaner[], orgFields: any[], services: any) {
    if (!(orgId && cleaners && orgFields)) {
      throw new Error('Please, provide all required parameters for coordinator creation')
    }

    this.orgId = orgId
    this.cleaners = cleaners || []
    this.orgFields = orgFields || []
    this.jobScheduler = { add: services.addJobToCloudTask }
    this.transformer = new SimpleTransformer({ getValueMapping: services.getValueMapping })
    this.services = services
  }

  static async create(orgId: string, services: any) {
    logger.info(`Create new MeritsCoordinator for Org: ${orgId}`)
    const [orgFieldsResponse, cleanersResponse] = await Promise.all([
      services.getOrgFields(orgId),
      services.getOrgCleaners(orgId)
    ])

    const orgFields = orgFieldsResponse.fields
    const cleaners = cleanersResponse[0]

    return new NewMeritsCoordinator(orgId, cleaners, orgFields, services)
  }

  async scheduleTransforms(merit: IMerit) {
    try {
      for (const cleaner of this.cleaners) {
        const fieldValue = merit.fieldValues.find(el => el.fieldId === cleaner.fieldId)
        if (!fieldValue) continue

        const result = await this.transformer.transform(cleaner.id, fieldValue.value)
        if (result.updated && (fieldValue.value !== result.value)) {
          logger.info(`Scheduling transform job for merit: ${merit.id}`)

          const jobData: JobData = {
            meritId: merit.id,
            oldFieldValue: { ...fieldValue },
            newFieldValue: { fieldId: fieldValue.fieldId, value: result.value },
            meta: {
              runId: '',
              orgId: this.orgId,
              meritTemplateId: merit.meritTemplateId,
              cleanerId: cleaner.id
            }
          }

          this.jobScheduler.add(jobData)
        }
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error(`Error scheduling transforms for merit: ${merit.id}`)
      logger.error(err)
    }
  }

  async extractValues(merit: IMerit) {
    try {
      for (const cleaner of this.cleaners) {
        const fieldValue = merit.fieldValues.find(el => el.fieldId === cleaner.fieldId)
        if (!fieldValue) continue

        const orgField = this.orgFields.find(el => el.id === cleaner.fieldId)
        if (!orgField) throw new Error('Cannot find field data for value extraction')

        const data = {
          cleanerId: cleaner.id,
          inputValue: fieldValue.value,
          outputValue: ''
        }

        logger.info(`Extract values for merit: ${merit.id}`)

        await this.services.saveFieldValues(data)
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error(`Error extracting values from merit:, ${merit.id}`)
      logger.error(err)
    }
  }

  async processMeritTemplate(meritTemplateId: string) {
    logger.info(`Processing merit template: ${meritTemplateId}`)

    try {
      let checkpoint = await MeritsCheckpoint.load(this.orgId, meritTemplateId, this.services)
      if (checkpoint === null) {
        checkpoint = await MeritsCheckpoint.initialize(this.orgId, meritTemplateId, '', this.services)
      }
      const pageFetcher = new MeritsPageFetcher(this.orgId, meritTemplateId, checkpoint, { getMeritsOnCursor: this.services.getMeritsOnCursor })

      while (pageFetcher.hasNextPage()) {
        const merits = await pageFetcher.getNextPage()
        if (!merits.length) break

        for (const merit of merits) {
          if (NonEditableStatuses.includes(merit.status)) {
            logger.info(`Skipping noneditable merit: ${merit.id}`)
            continue
          }
          logger.info(`Processing merit: ${merit.id}`)

          await Promise.all([
            this.scheduleTransforms(merit),
            this.extractValues(merit)
          ])
        }
        await pageFetcher.updateCheckpoint()
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error(`Error processing merit template: ${meritTemplateId}`)
      logger.error(err)
    }
  }

  async start() {
    logger.info(`Starting incremental merits processing for org ${this.orgId}`)

    const allActiveMtIds =
      this.cleaners
        .filter(el => el.active)
        .map(el => el.meritTemplates).reduce((acc, val) => [...acc, ...val], [])
        .filter(el => el.active)
        .map(el => el.id)

    const meritTemplateIds = Array.from(new Set<string>(allActiveMtIds))
    logger.info(`Processing ${meritTemplateIds.length} of Merit Template IDs`)

    for (const meritTemplateId of meritTemplateIds) {
      await this.processMeritTemplate(meritTemplateId)
    }
    logger.info(`Incremental merits processing done for org ${this.orgId}`)
  }
}
