import { expect } from 'chai'
import { Connection } from 'typeorm'
import connect from '../../src/db'
import { Cleaner, ICleaner } from '../../src/entities/cleaner'
import { FetcherState } from '../../src/entities/fetcherState'
import { CleanerService } from '../../src/services/cleaner.service'
import { ISchedulerService, SchedulerService } from '../../src/services/scheduler.service'

describe('[Service] Cleaner', () => {
  let connection: Connection
  before(async () => {
    connection = await connect('cleaner-tests')
  })

  afterEach(async () => {
    await connection
      .createQueryBuilder()
      .delete()
      .from(Cleaner)
      .execute()
  })

  after(async () => {
    await connection.close()
  })
  describe('Cleaner.save', () => {
    it('should be able save a new record without errors', async () => {
      const data: ICleaner = {
        name: 'Rule Set #1',
        description: "",
        meritTemplates: [
          { id: '111111', active: true },
          { id: '222222', active: false }
        ],
        fieldId: '8988888',
        fieldName: 'Job Position',
        fieldType: 'ShortText',
        orgId: '908837828',
        active: false
      }
      const repository = connection.getRepository(Cleaner)
      const fetcherStateRepository = connection.getRepository(FetcherState)
      const schedulerServiceMock: ISchedulerService = {
        scheduleInitValuesExtraction: () => Promise.resolve()
      }

      const cleanerService = new CleanerService(repository, fetcherStateRepository, schedulerServiceMock)
      const result = await cleanerService.create(data)

      const r = await repository.findOne({ id: result.id })
      expect(r.id).to.eq(result.id)
      expect(r.fieldId).to.eq(result.fieldId)
      expect(r.meritTemplates).to.deep.eq(result.meritTemplates)
    })

    it('should be able to update an existing record', async () => {
      // seed initial data
      const data: ICleaner = {
        name: 'Rule Set #1',
        description: "",
        meritTemplates: [
          { id: '111111', active: true },
          { id: '222222', active: false },
          { id: '333333', active: false }
        ],
        fieldId: '8988888',
        fieldName: 'Job Position',
        fieldType: 'ShortText',
        orgId: '908837828',
        active: false
      }
      const repository = connection.getRepository(Cleaner)
      const fetcherStateRepository = connection.getRepository(FetcherState)
      const schedulerServiceMock: ISchedulerService = {
        scheduleInitValuesExtraction: () => Promise.resolve()
      }

      const cleanerService = new CleanerService(repository, fetcherStateRepository, schedulerServiceMock)

      const result = await cleanerService.create(data)

      const updates: ICleaner = {
        id: result.id,
        meritTemplates: [
          ...data.meritTemplates,
          { id: '333333', active: true }
        ],
        active: true
      }

      await cleanerService.create(updates)
      const r = await repository.findOne({ id: result.id })
      expect(r.id).to.eq(result.id)
      expect(r.fieldId).to.eq(result.fieldId)
      expect(r.meritTemplates).to.deep.eq(updates.meritTemplates)
    })
  })
})
