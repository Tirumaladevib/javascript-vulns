import config from '../config'
import connect from '../db'
import logger from '../logger'
import { sentry } from '../sentry'
import { createServer, CloudTaskServerConfig, CloudTaskServerServices } from './cloudTaskServer'
import { ProcessLog } from '../entities/processLog'
import { ProcessLogService } from '../services/processLog.service'
import { JobLog } from '../entities/jobLog'
import { JobLogService } from '../services/jobLog.service'
import { SUBSCRIBER } from '../constant'
import { getRetryScheduler, getJobLogger } from '../modules/retries'
import { scheduleTask } from '../modules/queue'
import { editField, findProcessLogs, logJobData } from './services'

const start = async (port: number) => {
  const connection = await connect(SUBSCRIBER)
  const processLogRepository = connection.getRepository(ProcessLog)
  const processLogService = new ProcessLogService(processLogRepository)

  const jobLogRepository = connection.getRepository(JobLog)
  const jobLogService = new JobLogService(jobLogRepository)

  const serverConfig: CloudTaskServerConfig = {
    maxNumberOfJobRetries: 5
  }

  const services: CloudTaskServerServices = {
    editField: editField,
    logJobData: logJobData(processLogService),
    scheduleRetryJob: getRetryScheduler(scheduleTask),
    logFailedJob: getJobLogger(jobLogService),
    findProcessLogs: findProcessLogs(processLogService)
  }

  const server = createServer(serverConfig, services)
  server.listen(port, '0.0.0.0', (error, address) => {
    if (error) {
      sentry.captureException(error)
      logger.error(error)
      process.exit(1)
    }

    logger.info(`Server listening on ${address}`)
  })
}

start(config.port || 8000)