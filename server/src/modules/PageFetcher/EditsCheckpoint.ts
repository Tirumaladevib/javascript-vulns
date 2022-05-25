import { Checkpoint, EditsCheckpointData } from './types'
import logger from '../../logger'

export class EditsCheckpoint implements Checkpoint {
  private type: 'edits'
  private id: string
  private orgId: string
  private retries: number
  private lastCursor: string
  private services: any

  private constructor(data: EditsCheckpointData, services: any) {
    Object.assign(this, { ...data, services })
  }

  static async initialize(orgId: string, lastCursor: string = '', services: any) {
    logger.info(`Initialize Edit Checkpoint for orgId: ${orgId} on cursor: ${lastCursor}`)

    const data = { type: 'edits', orgId, retries: 1, lastCursor } as EditsCheckpointData
    const checkpointData = await services.createCheckpoint(data) as EditsCheckpointData
    return new EditsCheckpoint(checkpointData['0'], services)
  }

  static async load(orgId: string, services: any) {
    logger.info(`Load Edit Checkpoint for orgId: ${orgId}`)

    const checkpointData = await services.getCheckpoint('edits', orgId) as EditsCheckpointData
    if (!checkpointData) return null
    return new EditsCheckpoint(checkpointData, services)
  }

  getData() {
    const { type, id, orgId, retries, lastCursor } = this
    return { type, id, orgId, retries, lastCursor }
  }

  getCursor() {
    return this.lastCursor
  }

  update(newCursor: string) {
    const { id, type, orgId, retries } = this
    logger.info(`Update Edit Checkpoint for orgId: ${this.orgId} with new cursor on: ${newCursor}`)

    return this.services.updateCheckpoint({ id, type, orgId, retries, lastCursor: newCursor })
  }
}
