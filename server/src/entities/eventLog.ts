import { Entity, Column, OneToMany } from 'typeorm'
import { Base } from './base'

export interface IEventLog {
	id?: string
	userId?: string
	type?: string
	orgId?: string
	cleanerId?: string
	data?: any
}

@Entity()
export class EventLog extends Base {
	@Column()
	userId: string

	@Column()
	type: string

	@Column()
	orgId: string

	@Column()
	cleanerId: string

	@Column('jsonb')
	data: any
}
