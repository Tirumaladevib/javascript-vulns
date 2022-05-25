import { MeritsPageFetcher } from '../modules/PageFetcher'
import { ValuesCheckpoint } from '../modules/PageFetcher/ValuesCheckpoint'
import { sentry } from '../sentry'
import { IMerit } from '../types/merit'
import logger from '../logger'

export type FieldData = {
  cleanerId: string
  fieldId: string
  fieldType: string
  fieldName: string
}

export class ValuesExtractionCoordinator {
  private orgId: string
  private fieldData: FieldData
  private meritTemplateId: string
  private services: any

  constructor(orgId: string, fieldData: FieldData, meritTemplateId, services: any) {
    if (!(orgId && meritTemplateId && (fieldData && fieldData.cleanerId && fieldData.fieldId))) {
      throw new Error('Please, provide all required parameters for coordinator creation')
    }
    
    this.orgId = orgId
    this.fieldData = fieldData
    this.meritTemplateId = meritTemplateId
    this.services = services
  }

  async processMerits(merits: IMerit[]) {
    try {
      merits.forEach(el => logger.info(el.fieldValues))
      const fieldValues =
        merits
          .map(el => el.fieldValues)
          .reduce((acc, val) => acc.concat(val), []) // flat() has some typescript problem
          .filter(el => el.fieldId === this.fieldData.fieldId)
          .map(el => ({
            cleanerId: this.fieldData.cleanerId,
            inputValue: el.value,
            outputValue: '',
          }))

      await this.services.saveFieldValues(fieldValues)
    } catch (err) {
      sentry.captureException(err)
      logger.error(`Error processing merits: ${merits[0].id}`)
      logger.error(err)
    }
  }

  async processMeritTemplate() {
    try {
      let checkpoint = await ValuesCheckpoint.load(this.orgId, this.meritTemplateId, this.services)
      if (checkpoint === null) checkpoint = await ValuesCheckpoint.initialize(this.orgId, this.meritTemplateId, '', this.services)
      const pageFetcher = new MeritsPageFetcher(this.orgId, this.meritTemplateId, checkpoint, { getMeritsOnCursor: this.services.getMeritsOnCursor })

      while (pageFetcher.hasNextPage()) {
        const merits = await pageFetcher.getNextPage()
        if (!merits.length) break

        await this.processMerits(merits)

        await pageFetcher.updateCheckpoint()
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error(`Error processing merit template: ${this.meritTemplateId}`)
      logger.error(err)
    }
  }

  async start() {
    logger.info(`Starting unique values extraction for merit template: ${this.meritTemplateId}`)
    await this.processMeritTemplate()
    logger.info('Done')
  }
}
