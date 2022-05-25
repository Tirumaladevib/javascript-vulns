import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import { Cleaner } from '../entities/cleaner'
import { EventLog } from '../entities/eventLog'
import { FetcherRun } from '../entities/fetcherRun'
import { FetcherState } from '../entities/fetcherState'
import { User } from '../entities/user'

import { CleanerService } from '../services/cleaner.service'
import { FetcherRunService } from '../services/fetcherRun.service'
import { FetcherStateService } from '../services/fetcherState.service'
import { EventLogService } from '../services/eventLog.service'

import { Merit } from '../modules/merit'
import { MappingService } from '../services/mapping.service'
import { Mapping } from '../entities/mapping'
import logger from '../logger'
import connect from '../db'
import { sentry } from '../sentry'
import { API } from '../constant'
import { SchedulerService } from '../services/scheduler.service'
import { JobLog } from '../entities/jobLog'
import { JobLogService } from '../services/jobLog.service'

const ONE_DAY_IN_SECONDS = 60 * 60 * 24

export default fp<FastifyInstanceExtension>(async (f: FastifyInstance, _: any) => {
  try {
    const connection = await connect(API)
    const repositories = {
      cleaner: connection.getRepository(Cleaner),
      fetcherRun: connection.getRepository(FetcherRun),
      fetcherState: connection.getRepository(FetcherState),
      eventLog: connection.getRepository(EventLog),
      user: connection.getRepository(User),
      mapping: connection.getRepository(Mapping),
      jobLog: connection.getRepository(JobLog)
    }

    const services = {
      cleaner: new CleanerService(repositories.cleaner, repositories.fetcherState, new SchedulerService()),
      fetcherRun: new FetcherRunService(repositories.fetcherRun),
      fetcherState: new FetcherStateService(repositories.fetcherState),
      eventLog: new EventLogService(repositories.eventLog),
      mapping: new MappingService(repositories.mapping),
      jobLog: new JobLogService(repositories.jobLog)
    }

    const modules = {
      merit: new Merit(services.fetcherState)
    }

    f.decorate('db', repositories)
    f.decorate('services', services)
    f.decorate('modules', modules)
  } catch (e) {
    logger.error(e)
    sentry.captureException(e)
  }
})
