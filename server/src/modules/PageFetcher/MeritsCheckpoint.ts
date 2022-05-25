import { Checkpoint, MeritsCheckpointData } from './types'

export class MeritsCheckpoint implements Checkpoint {
  private type: 'merits'
  private id: string
  private orgId: string
  private meritTemplateId: string
  private retries: number
  private lastCursor: string
  private services: any

  constructor (data: MeritsCheckpointData, services: any) {
    Object.assign(this, { ... data })
    this.services = services
  }

  static async initialize (orgId: string, meritTemplateId: string, lastCursor: string, services: any) {
    const data = { type: 'merits', orgId, meritTemplateId, retries: 1, lastCursor } as MeritsCheckpointData
    const checkpointData = await services.createCheckpoint(data) as MeritsCheckpointData
    return new MeritsCheckpoint(checkpointData['0'], services)
  }

  static async load (orgId: string, meritTemplateId: string, services: any) {
    const checkpointData = await services.getCheckpoint('merits', orgId, meritTemplateId) as MeritsCheckpointData
    if (!checkpointData) return null
    return new MeritsCheckpoint(checkpointData, services)
  }

  getData () {
    const { type, id, orgId, meritTemplateId, retries, lastCursor } = this
    return { type, id, orgId, meritTemplateId, retries, lastCursor }
  }

  getCursor () {
    return this.lastCursor
  }

  update (newCursor: string) {
    const { id, type, orgId, meritTemplateId, retries } = this
    return this.services.updateCheckpoint({ id, type, orgId, meritTemplateId, retries, lastCursor: newCursor })
  }
}
