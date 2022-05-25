import { Entity, Column, Index, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm'

@Entity()
export class Token {
  @PrimaryColumn()
  @Index()
  orgId: string

  @Column()
  orgAccessToken: string

	@CreateDateColumn()
	createdAt: string

	@UpdateDateColumn()
	updatedAt: string
}
