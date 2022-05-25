import {
  Column,
  JoinColumn,
  ManyToOne,
  Entity,
  Generated,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { Cleaner } from './cleaner'

export interface IMapping {
  cleanerId: string
  inputValue: string
  outputValue: string
}

@Entity()
export class Mapping {
  @PrimaryColumn()
  cleanerId: string

  @PrimaryColumn()
  inputValue: string

  @Column({ nullable: true })
  outputValue: string

  @Column({ unique: true })
  @Generated('uuid')
	id: string

  @CreateDateColumn()
	createdAt: string

	@UpdateDateColumn()
	updatedAt: string

  @ManyToOne(() => Cleaner)
  @JoinColumn()
  meritField: Cleaner
}
