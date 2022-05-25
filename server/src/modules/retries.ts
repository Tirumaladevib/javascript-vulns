import logger from '../logger'
import { sentry } from '../sentry'
import { JobData } from '../types/merit'
import { JobLogService } from '../services/jobLog.service'
import { CloudTaskServerEndpoints } from '../cloudTaskServer/cloudTaskServer'

type ScheduleJobFn = <PayloadType>(url: CloudTaskServerEndpoints, payload: PayloadType, scheduleTimeInSecondsFromNow?: number) => Promise<void>

export const getRetryScheduler = (scheduleJob: ScheduleJobFn) => async (data: JobData) => {
  try {
    logger.info(`Add job to queue for retry: ${JSON.stringify(data)}`)

    const SCHEDULE_TIME_IN_HOURS_FROM_NOW = 12
    const pastRetriesCount = typeof data.retry === 'number' ? data.retry : 0

    await scheduleJob<JobData>(
      CloudTaskServerEndpoints.PROCESS_MERIT,
      { ...data, retry: pastRetriesCount + 1 },
      SCHEDULE_TIME_IN_HOURS_FROM_NOW * 3600
    )
  } catch (err) {
    logger.error(err)
    sentry.captureException(err)
  }
}

export const getJobLogger = (jobLogService: JobLogService) => async (data: JobData) => {
  try {
    await jobLogService.save(data)
  } catch (err: unknown) {
    logger.error(err)
    sentry.captureException(err)
  }
}
