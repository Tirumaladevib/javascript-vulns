import { MeritsCheckpoint } from './MeritsCheckpoint'
import { PageFetcher } from './types'
import { ValuesCheckpoint } from './ValuesCheckpoint'
import logger from '../../logger'

export class MeritsPageFetcher implements PageFetcher {
  public orgId: string
  public meritTemplateId: string
  private checkpoint: MeritsCheckpoint | ValuesCheckpoint
  private nextCursor: string
  private nextPageExists: boolean
  private services: any

  constructor(orgId: string, meritTemplateId: string, checkpoint: MeritsCheckpoint | ValuesCheckpoint, services: any) {
    this.orgId = orgId
    this.meritTemplateId = meritTemplateId
    this.checkpoint = checkpoint
    this.nextCursor = this.checkpoint.getCursor()
    this.nextPageExists = true
    this.services = services
  }

  hasNextPage() {
    return this.nextPageExists
  }

  async getNextPage() {
    logger.info(`Getting merits on cursor: ${this.nextCursor}`)
    const { merits, paging } = await this.services.getMeritsOnCursor(this.orgId, this.meritTemplateId, this.nextCursor)
    if (paging) {
      this.nextCursor = paging.cursors.after
      this.nextPageExists = paging.pageInfo.hasNextPage
    } else {
      this.nextPageExists = false
    }

    return merits
  }

  async updateCheckpoint() {
    logger.info(`Updating checkpoint on cursor: ${this.nextCursor}`)
    await this.checkpoint.update(this.nextCursor)
  }
}
