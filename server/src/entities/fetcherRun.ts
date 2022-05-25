import { Entity, Column } from 'typeorm'
import { Base } from './base'

export interface IFetcherRun {
	orgId?: string
	id?: string
	cleanerIds?: string[]
}

@Entity()
export class FetcherRun extends Base {
	@Column()
	orgId: string

	@Column('simple-array')
	cleanerIds: string[]
}
