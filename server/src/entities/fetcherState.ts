import { Entity, Column } from 'typeorm'
import { Base } from './base'

export interface IFetcherState {
	id?: string
	meritTemplateId?: string
	type?: string
	orgId?: string
	retries?: number
	lastCursor?: string
}

@Entity()
export class FetcherState extends Base {
	@Column({ nullable: true })
	meritTemplateId: string

	@Column()
	type: string

	@Column()
	orgId: string

	@Column('int')
	retries: number

	@Column({ nullable: true })
	lastCursor: string
}
