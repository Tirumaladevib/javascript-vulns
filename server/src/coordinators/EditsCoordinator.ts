import { ICleaner } from '../entities/cleaner'
import { EditsPageFetcher, EditsCheckpoint } from '../modules/PageFetcher'
import { SimpleTransformer } from '../modules/Transformer'
import { sentry } from '../sentry'
import logger from '../logger'
import { IEdit, JobData } from '../types/merit'

export class EditsCoordinator {
  private orgId: string
  private cleaners: ICleaner[]
  private appId: string
  private jobScheduler: any
  private transformer: SimpleTransformer
  private services: any

  private constructor(orgId: string, cleaners: any, appId: string, services: any) {
    if (!(orgId && cleaners && appId)) {
      throw new Error('Please, provide all required parameters for coordinator creation')
    }
    
    this.orgId = orgId
    this.cleaners = cleaners
    this.appId = appId
    this.jobScheduler = { add: services.addJobToCloudTask }
    this.transformer = new SimpleTransformer({ getValueMapping: services.getValueMapping })
    this.services = services
  }

  static async create(orgId: string, appId: string, services: any) {
    logger.info(`Creating EditsCoordinator with orgId: ${orgId}`)

    const cleanersResponse = await services.getOrgCleaners(orgId)
    const cleaners = cleanersResponse[0]

    return new EditsCoordinator(orgId, cleaners, appId, services)
  }

  async scheduleTransform(edit: IEdit) {
    try {
      for (const cleaner of this.cleaners) {
        if (edit.fieldId !== cleaner.fieldId) continue
        const fieldValue = edit.newValue
        
        const result = await this.transformer.transform(cleaner.id, fieldValue.value)
        if (result.updated && (fieldValue.value !== result.value)) {
          logger.info(`Scheduling transform job for edit: ${edit.id}`)

          const jobData: JobData = {
            meritId: edit.meritId,
            oldFieldValue: { ...fieldValue },
            newFieldValue: { fieldId: fieldValue.fieldId, value: result.value },
            meta: {
              runId: '',
              orgId: this.orgId,
              meritTemplateId: edit.meritTemplateId,
              cleanerId: cleaner.id
            }
          }

          await this.jobScheduler.add(jobData)
        }
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error(`Error processing edit: ${edit.id}`)
      logger.error(err)
    }
  }

  async extractValues(edit: IEdit) {
    try {
      for (const cleaner of this.cleaners) {
        if (edit.fieldId !== cleaner.fieldId) continue
        const fieldValue = edit.newValue

        const data = {
          cleanerId: cleaner.id,
          inputValue: fieldValue.value,
          outputValue: ''
        }

        logger.info(`Extracting value: ${JSON.stringify(data)}`)

        await this.services.saveFieldValues(data)
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error(`Error extracting values from edit: ${edit.id}`)
      logger.error(err)
    }
  }

  filterEdits(edits: any) {
    const fieldIds = this.cleaners.filter(el => el.active).map(el => el.fieldId)
    const activeMeritTemplateIds =
      this.cleaners
        .map(el => el.meritTemplates).reduce((acc, val) => [...acc, ...val], [])
        .filter(el => el.active)
        .map(el => el.id)

    const editsOfInterest =
      edits
        .filter(el => el.actor.actorId !== this.appId)
        .filter(el => fieldIds.includes(el.fieldId))
        .filter(el => activeMeritTemplateIds.includes(el.meritTemplateId))

    return editsOfInterest
  }

  async processEditsPages() {
    try {
      let checkpoint = await EditsCheckpoint.load(this.orgId, this.services)
      if (!checkpoint) {
        const todaysEditsResponse = await this.services.getTodaysFirstEdit(this.orgId)
        if (todaysEditsResponse) {
          const cursor = todaysEditsResponse.paging.cursors.after
          checkpoint = await EditsCheckpoint.initialize(this.orgId, cursor, this.services)
        } else {
          throw new Error('Cannot get initial edits cursor')
        }
      }
      const pageFetcher = new EditsPageFetcher(this.orgId, checkpoint, this.services)

      while (pageFetcher.hasNextPage()) {
        const allEdits = await pageFetcher.getNextPage()
        if (!allEdits.length) break

        const editsOfInterest = this.filterEdits(allEdits)
        for (const edit of editsOfInterest) {
          const promises = [
            this.scheduleTransform(edit),
            this.extractValues(edit)
          ]
          await Promise.all(promises)
        }
        await pageFetcher.updateCheckpoint()
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error('Error processing edits')
      logger.error(err)
    }
  }

  async start() {
    logger.info(`Starting with incremental edits processing for org ${this.orgId}`)
    await this.processEditsPages()
    logger.info(`Incremental edits processing done for org ${this.orgId}`)
  }
}
