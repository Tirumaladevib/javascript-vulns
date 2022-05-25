import { expect } from 'chai'
import { Connection } from 'typeorm'

import connect from '../../src/db'
import { FetcherState } from '../../src/entities/fetcherState'
import { FetcherStateService } from '../../src/services/fetcherState.service'
import { validFetcherState } from '../fixtures/fetcherState'

describe('[Service] Fetcher State', () => {
  let connection: Connection
  before(async () => {
    connection = await connect('fetcher-run-tests')
  })

  afterEach(async () => {
    await connection
      .createQueryBuilder()
      .delete()
      .from(FetcherState)
      .execute()
  })

  after(async () => {
    await connection.close()
  })
  describe('FetcherStateService.insert', () => {
    it('should be able to create a new fetcher state record errors', async () => {
      const repository = connection.getRepository(FetcherState)
      const service = new FetcherStateService(repository)
      const result = await service.save([ { ...validFetcherState }])
      const recordId: string = result[0].id

      const r = await repository.findOne({ id: recordId })
      expect(r.id).to.eq(recordId)
      expect(r.meritTemplateId).to.eq(validFetcherState.meritTemplateId)
      expect(r.orgId).to.eq(validFetcherState.orgId)
      expect(r.lastCursor).to.deep.eq(validFetcherState.lastCursor)
    })

    it('should be able to create a batch of fetcher states', async () =>{
      const repository = connection.getRepository(FetcherState)
      const service = new FetcherStateService(repository)
      await service.save([
        {
          ...validFetcherState,
          type: 'edit'
        },
        {
          ...validFetcherState,
          type: 'new'
        }
      ])

      const r = await repository.find()
      expect(r.length).to.eq(2)
    })
  })
})
