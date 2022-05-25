import { Repository, DeepPartial, DeleteResult, FindManyOptions } from 'typeorm'
import { Cleaner, ICleaner } from '../entities/cleaner'
import { ISchedulerService } from './scheduler.service'
import logger from '../logger'
import { sentry } from '../sentry'
import { FetcherState } from '../entities/fetcherState'

export class CleanerService {
  private readonly cleanerRepository: Repository<Cleaner>
  private readonly fetcherStateRepository: Repository<FetcherState>
  private readonly schedulerService: ISchedulerService

  constructor(r: Repository<Cleaner>, fs: Repository<FetcherState>, schedulerService: ISchedulerService) {
    this.cleanerRepository = r
    this.fetcherStateRepository = fs
    this.schedulerService = schedulerService
  }

  async create(cleaner: ICleaner): Promise<Cleaner> {
    // TODO Add validations
    try {
      const result: Cleaner = await this.cleanerRepository.save(cleaner)

      const jobFieldData = {
        cleanerId: cleaner.id,
        fieldId: cleaner.fieldId,
        fieldName: cleaner.fieldName,
        fieldType: cleaner.fieldType,
      }
      const meritTemplateIds = cleaner.meritTemplates.map(el => el.id)
      await this.schedulerService.scheduleInitValuesExtraction(cleaner.orgId, jobFieldData, meritTemplateIds)

      return result
    } catch (err) {
      logger.error(err)
      sentry.captureException(err)
    }
  }

  async update(id: string, cleaner: DeepPartial<Cleaner>) {
    logger.info(`Update Cleaner: ${id}`)

    const result = await this.cleanerRepository.update({ id }, { ...cleaner });
    return result
  }

  async findOne(options?: DeepPartial<Cleaner>): Promise<Cleaner> {
    const cleaner: Cleaner = await this.cleanerRepository.findOne(options)
    return cleaner
  }

  async findAll(orgId: string, query?: FindManyOptions<Cleaner>): Promise<[Cleaner[], number]> {
    const [cleaners, count] = await this.cleanerRepository.findAndCount({
      where: { orgId },
      order: {
        "createdAt": "DESC",
      },
      ...query,
    })

    return [cleaners, count]
  }

  async remove(options?: DeepPartial<Cleaner>) {
    logger.info(`Remove Cleaner: ${options}`)
    const cleaner: Cleaner = await this.cleanerRepository.findOne(options)

    for (const cleanerMeritTemplate of cleaner.meritTemplates) {
      await this.fetcherStateRepository.delete({ meritTemplateId: cleanerMeritTemplate.id })
    }

    const result: DeleteResult = await this.cleanerRepository.delete(options)

    return result
  }
}
