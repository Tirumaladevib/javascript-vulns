import { expect } from 'chai'
import { Connection } from 'typeorm'

import connect from '../../src/db'
import { FetcherRun } from '../../src/entities/fetcherRun'
import { FetcherRunService } from '../../src/services/fetcherRun.service'

describe('[Service] Fetcher State', () => {
	let connection: Connection
	before(async () => {
		connection = await connect('fetcher-state-tests')
	})

	afterEach(async () => {
		await connection
			.createQueryBuilder()
			.delete()
			.from(FetcherRun)
			.execute()
	})

	after(async () => {
		await connection.close()
	})
	describe('FetcherStateService.insert', () => {
    it('should be able to create a new fetcher run record without errors', async () => {
			const repository = connection.getRepository(FetcherRun)
			const service = new FetcherRunService(repository)
			const data = {
				orgId: '92a08b666ad04861b5b83dac5431e563',
				cleanerIds: [
					'92a08b666ad04861b5b83dac5431e563',
					'07e5af0a60874fad8ffb4c517c9dc0f5'
				]
			}
			const result = await service.save(data)
			const r = await repository.findOne({ id: result.id})
			expect(r.id).to.eq(result.id)
			expect(r.cleanerIds).to.deep.eq(data.cleanerIds)
		})
	})
})
