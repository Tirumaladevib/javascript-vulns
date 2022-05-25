import { expect } from 'chai'
import { Connection } from 'typeorm'

import connect from '../src/db'
import { Cleaner } from '../src/entities/cleaner'

describe('DB connection test', async () => {
	let connection: Connection
	before(async () => {
		connection = await connect()
	})

	after(async () => {
		await connection
			.createQueryBuilder()
			.delete()
			.from(Cleaner)
			.execute()
		await connection.close()
	})
  it('should be able to read and write to the database', async () => {
		await connection
			.createQueryBuilder()
			.insert()
			.into(Cleaner)
			.values([
				{
					name: "Rule set #3",
					description: "",
					meritTemplates: [
						{
							id: '7777777',
							active: true
						}
					],
					fieldId: '8888',
					fieldName: 'Job Position',
					fieldType: 'ShortText',
					orgId: '998883',
					active: true
				}
			])
			.execute()
		const repository = connection.getRepository(Cleaner)
		const r = await repository.findOne({
			fieldName: 'Job Position'
		})
		expect(r.fieldName).to.eq('Job Position')
	})
})
