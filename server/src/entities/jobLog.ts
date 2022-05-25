import { Entity, Column, PrimaryColumn } from 'typeorm'
import { FieldValue, JobMetaData } from '../types/merit'

@Entity()
export class JobLog {
	@PrimaryColumn()
	id: string

	@Column()
	meritId: string

	@Column('jsonb')
	newFieldValue: FieldValue

	@Column('jsonb')
	oldFieldValue: FieldValue

	@Column('jsonb')
	meta: JobMetaData
}
