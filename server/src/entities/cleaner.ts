import { Entity, Column } from 'typeorm'
import { Base } from './base'

export interface CleanerMeritTemplate {
  id: string
  active: boolean
}

export interface ICleaner {
  name?: string
  description?: string
  id?: string
  meritTemplates?: CleanerMeritTemplate[]
  fieldId?: string
  fieldName?: string
  fieldType?: string
  orgId?: string
  active?: boolean
}

@Entity()
export class Cleaner extends Base {
  @Column()
  name: string

  @Column()
  description: string

  @Column('jsonb')
  meritTemplates: CleanerMeritTemplate[]

  @Column()
  fieldId: string

  @Column()
  fieldName: string

  @Column()
  fieldType: string

  @Column()
  orgId: string

  @Column('bool')
  active: boolean
}
