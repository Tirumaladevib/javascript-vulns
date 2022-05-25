import { PageFetcher } from './types'
import { EditsCheckpoint } from './EditsCheckpoint'
import logger from '../../logger'

export class EditsPageFetcher implements PageFetcher {
  private orgId: string
  private checkpoint: EditsCheckpoint
  private nextCursor: string
  private nextPageExists: boolean
  private services: any

  constructor(orgId: string, checkpoint: EditsCheckpoint, services: any) {
    this.orgId = orgId
    this.checkpoint = checkpoint
    this.nextCursor = this.checkpoint.getCursor()
    this.nextPageExists = true
    this.services = services
  }

  hasNextPage() {
    return this.nextPageExists
  }

  async getNextPage() {
    logger.info(`Getting edits on cursor: ${this.nextCursor}`)

    const { meritEdits, paging } = await this.services.getEditsOnCursor(this.orgId, this.nextCursor)
    if (paging) {
      this.nextCursor = paging.cursors.after
      this.nextPageExists = paging.pageInfo.hasNextPage
    } else {
      this.nextPageExists = false
    }

    return meritEdits
  }

  async updateCheckpoint() {
    logger.info(`Update checkpoint on cursor: ${this.nextCursor}`)

    await this.checkpoint.update(this.nextCursor)
  }
}
