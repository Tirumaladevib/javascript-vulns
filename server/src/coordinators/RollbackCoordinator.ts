import { ProcessLog } from "../entities/processLog";
import logger from "../logger";
import { sentry } from "../sentry";
import { JobData } from "../types/merit";

export type FindProcessLogsFn = (value: string, page: number) => Promise<[ProcessLog[], number]>
export type InitFindProcessLogsFn = (pageSize: number) => FindProcessLogsFn
export type AddJobToQueueFn = (data: JobData) => Promise<void>

export type RollbackCoordinatorServices = {
  initFindProcessLogs: InitFindProcessLogsFn
  addRollbackJobToCloudTask: AddJobToQueueFn
}

export class RollbackCoordinator {
  private orgId: string
  private cleanerId: string
  private rollbackValue: string
  private addRollbackJobToCloudTask: AddJobToQueueFn
  private findProcessLogs: FindProcessLogsFn
  private pageSize: number
  private lastProcessedPage: number
  private processedLogs: number

  constructor (data: { orgId: string, cleanerId: string, rollbackValue: string }, config: { pageSize?: number }, services: RollbackCoordinatorServices) {
    this.orgId = data.orgId
    this.cleanerId = data.cleanerId
    this.rollbackValue = data.rollbackValue
    this.pageSize = typeof config.pageSize !== 'undefined' ? config.pageSize : 100
    this.processedLogs = 0
    this.lastProcessedPage = 0

    this.addRollbackJobToCloudTask = services.addRollbackJobToCloudTask
    this.findProcessLogs = services.initFindProcessLogs(this.pageSize)
  }

  getNumberOfProcessedPages () {
    return this.lastProcessedPage
  }

  getNumberOfProcessedLogs () {
    return this.processedLogs
  }

  async processLog (log: ProcessLog) {
    const { fieldId, meritId, oldValue, newValue } = log
    if (newValue !== this.rollbackValue) throw new Error('Invalid rollback object')

    await this.addRollbackJobToCloudTask({
      meritId,
      newFieldValue: {
        fieldId,
        value: oldValue
      },
      oldFieldValue: {
        fieldId,
        value: newValue
      },
      meta: {
        orgId: this.orgId,
        cleanerId: this.cleanerId,
      }
    })

    this.processedLogs++
  }

  async start () {
    console.log('Start rollback')
    try {
      let init = true
      let logs: ProcessLog[] = []
  
      while (init || (logs?.length)) {
        const logsResponse = await this.findProcessLogs(this.rollbackValue, this.lastProcessedPage + 1)
        logs = logsResponse[0]
        
        const processLogsRequests = logs.map(el => this.processLog(el))
        await Promise.all(processLogsRequests)

        init = false
        if (logs?.length) this.lastProcessedPage++
      }

      console.log('Done')
    } catch (err) {
      logger.error(err)
      sentry.captureException(err)
    }
  }
}
