import { Entity, Column } from 'typeorm'
import { Base } from './base'

@Entity()
export class User extends Base {
  @Column()
	name: string
	
	@Column()
	meritMemberId: string

	@Column({ nullable: true })
	orgId: string

	@Column({ nullable: true })
	orgTitle: string
}
