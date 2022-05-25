import { Checkpoint, ValuesCheckpointData } from './types'

export class ValuesCheckpoint implements Checkpoint {
  private type: 'merits'
  private id: string
  private orgId: string
  private meritTemplateId: string
  private retries: number
  private lastCursor: string
  private services: any

  constructor (data: ValuesCheckpointData, services: any) {
    Object.assign(this, { ... data })
    this.services = services
  }

  static async initialize (orgId: string, meritTemplateId: string, lastCursor: string, services: any) {
    const data = { type: 'values', orgId, meritTemplateId, retries: 1, lastCursor } as ValuesCheckpointData
    const checkpointData = await services.createCheckpoint(data) as ValuesCheckpointData
    return new ValuesCheckpoint(checkpointData['0'], services)
  }

  static async load (orgId: string, meritTemplateId: string, services: any) {
    const checkpointData = await services.getCheckpoint('values', orgId, meritTemplateId) as ValuesCheckpointData
    if (!checkpointData) return null
    return new ValuesCheckpoint(checkpointData, services)
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
