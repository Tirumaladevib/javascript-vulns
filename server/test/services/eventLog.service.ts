import { expect } from 'chai'
import { Connection } from 'typeorm'

import connect from '../../src/db'
import { EventLog, IEventLog } from '../../src/entities/eventLog'
import { EventLogService } from '../../src/services/eventLog.service'

describe('[Service] Event Logger', () => {
	let connection: Connection
	before(async () => {
		connection = await connect('eventlog-tests')
	})

	afterEach(async () => {
		await connection
			.createQueryBuilder()
			.delete()
			.from(EventLog)
			.execute()
	})

	after(async () => {
		await connection.close()
	})
	describe('EventLoggerService.insert', () => {
    it('should be able to log an event without errors', async () => {
			const repository = connection.getRepository(EventLog)
			const service = new EventLogService(repository)
			const data: IEventLog = {
				userId: '506d714ab4c2443289df052ae61e8656',
				type: 'Add new rule',
				orgId: '506d714ab4c2443289df052ae61e8658',
				cleanerId: '506d714ab4c2443289df052ae61e865f',
				data: {
					changes: ['lead eng', 'dev lead']
				}
			}
			const result = await service.save(data)
			const r = await repository.findOne({ id: result.id })
			expect(r.id).to.eq(result.id)
			expect(r.type).to.eq(data.type)
			expect(r.data).to.deep.eq(data.data)
		})
	})
})
