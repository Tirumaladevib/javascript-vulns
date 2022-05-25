import { Entity, Column, OneToOne, JoinColumn }  from 'typeorm'
import { Base } from './base'
import { Cleaner } from './cleaner'

export interface CreateProcessLogDTO {
  oldValue: string
  newValue: string
  meritId: string
  cleanerId: string
  fetcherRunId: string
  fieldId: string
  orgId: string
}

@Entity()
export class ProcessLog extends Base {
  @Column()
  meritId: string

  @OneToOne(() => Cleaner)
  @JoinColumn()
  cleaner: Cleaner

  @Column()
  fetcherRunId: string

  @Column()
  fieldId: string

  @Column()
  orgId: string

  @Column()
  oldValue: string

  @Column()
  newValue: string
}
