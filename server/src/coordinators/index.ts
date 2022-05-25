/* eslint-disable import/first */

import config from '../config'
import connect from '../db'
import { Cleaner } from '../entities/cleaner'
import { FetcherState } from '../entities/fetcherState'
import { Mapping } from '../entities/mapping'
import { CleanerService } from '../services/cleaner.service'
import { FetcherStateService } from '../services/fetcherState.service'
import { MappingService } from '../services/mapping.service'
import { EditsCoordinator } from './EditsCoordinator'
import { NewMeritsCoordinator } from './NewMeritsCoordinator'
import { FieldData, ValuesExtractionCoordinator } from './ValuesExtractionCoordinator'
import {
  initGetCheckpointService,
  initCreateCheckpointService,
  initUpdateCheckpointService,
  initGetValueMappingService,
  initSaveValueMappingsService,
  getMeritsOnCursor,
  getEditsOnCursor,
  getOrgFields,
  getTodaysFirstEdit,
  addJobToCloudTask,
  initFindProcessLogs,
  addRollbackJobToCloudTask,
} from './services'
import logger from '../logger'
import {
  EDIT_PROCESSING,
  NEW_MERITS_PROCESSING,
  ROLLBACK_PROCESSING,
  VALUE_EXTRACTION_PROCESSING
} from '../constant'
import { sentry } from '../sentry'
import { SchedulerService } from '../services/scheduler.service'
import { RollbackCoordinator, RollbackCoordinatorServices } from './RollbackCoordinator'
import { ProcessLog } from '../entities/processLog'
import { ProcessLogService } from '../services/processLog.service'

export const startNewMeritsProcessing = async () => {
  logger.info(`Start processing new merits...`)

  const connection = await connect(NEW_MERITS_PROCESSING)

  const fetcherStateRepository = connection.getRepository(FetcherState)
  const fetcherStateService = new FetcherStateService(fetcherStateRepository)

  const cleanerRepository = connection.getRepository(Cleaner)
  const cleanerService = new CleanerService(cleanerRepository, fetcherStateRepository, new SchedulerService())

  const mappingRepository = connection.getRepository(Mapping)
  const mappingService = new MappingService(mappingRepository)

  const services = {
    getOrgCleaners: cleanerService.findAll.bind(cleanerService),
    getCheckpoint: initGetCheckpointService(fetcherStateService),
    createCheckpoint: initCreateCheckpointService(fetcherStateService),
    updateCheckpoint: initUpdateCheckpointService(fetcherStateService),
    getValueMapping: initGetValueMappingService(mappingService),
    addJobToCloudTask,
    saveFieldValues: initSaveValueMappingsService(mappingService),
    getMeritsOnCursor,
    getOrgFields,
  }

  try {
    const allCleaners = await cleanerRepository.find()
    const orgs = Array.from(new Set<string>(allCleaners.map(el => el.orgId)))

    for (const orgId of orgs) {
      const coordinator = await NewMeritsCoordinator.create(orgId, services)
      await coordinator.start()
    }
  } catch (err) {
    sentry.captureException(err)
    logger.error(err)
  }
}

export const startEditsProcessing = async () => {
  logger.info(`Start processing edit merits...`)

  const connection = await connect(EDIT_PROCESSING)

  const fetcherStateRepository = connection.getRepository(FetcherState)
  const fetcherStateService = new FetcherStateService(fetcherStateRepository)

  const cleanerRepository = connection.getRepository(Cleaner)
  const cleanerService = new CleanerService(cleanerRepository, fetcherStateRepository, new SchedulerService())

  const mappingRepository = connection.getRepository(Mapping)
  const mappingService = new MappingService(mappingRepository)

  const services = {
    getOrgCleaners: cleanerService.findAll.bind(cleanerService),
    getCheckpoint: initGetCheckpointService(fetcherStateService),
    createCheckpoint: initCreateCheckpointService(fetcherStateService),
    updateCheckpoint: initUpdateCheckpointService(fetcherStateService),
    getValueMapping: initGetValueMappingService(mappingService),
    saveFieldValues: initSaveValueMappingsService(mappingService),
    addJobToCloudTask,
    getEditsOnCursor,
    getTodaysFirstEdit,
  }

  try {
    const allCleaners = await cleanerRepository.find()
    const orgs = Array.from(new Set<string>(allCleaners.map(el => el.orgId)))
    
    logger.info(`Processing ${orgs.length} org(s)`)

    for (const orgId of orgs) {
      const coordinator = await EditsCoordinator.create(orgId, config.appId, services)
      await coordinator.start()
    }
  } catch (err) {
    sentry.captureException(err)
    logger.error(err)
  }
}

export const startValueExtraction = async (orgId: string, fieldData: FieldData, meritTemplateId: string) => {
  logger.info(`Start value extraction for orgId: ${orgId} with Merit Template Id: ${meritTemplateId}`)

  const connection = await connect(VALUE_EXTRACTION_PROCESSING)

  const fetcherStateRepository = connection.getRepository(FetcherState)
  const fetcherStateService = new FetcherStateService(fetcherStateRepository)

  const mappingRepository = connection.getRepository(Mapping);
  const mappingService = new MappingService(mappingRepository)

  const services = {
    getCheckpoint: initGetCheckpointService(fetcherStateService),
    createCheckpoint: initCreateCheckpointService(fetcherStateService),
    updateCheckpoint: initUpdateCheckpointService(fetcherStateService),
    saveFieldValues: initSaveValueMappingsService(mappingService),
    getMeritsOnCursor,
    getOrgFields
  }

  const coordinator = new ValuesExtractionCoordinator(orgId, fieldData, meritTemplateId, services)
  await coordinator.start()

  // await connection.close()
}

export const startRollback = async (orgId: string, cleanerId: string, rollbackValue: string) => {
  logger.info(`Start rollback...`)

  const connection = await connect(ROLLBACK_PROCESSING)

  const processLogsRepository = connection.getRepository(ProcessLog)
  const processLogService = new ProcessLogService(processLogsRepository)

  const services: RollbackCoordinatorServices = {
    addRollbackJobToCloudTask,
    initFindProcessLogs: initFindProcessLogs(processLogService),
  }

  try {
    const rollbackCoordinator = new RollbackCoordinator({ orgId, cleanerId, rollbackValue }, {}, services)
    await rollbackCoordinator.start()
    logger.info('Rollback process complete')
  } catch (err) {
    sentry.captureException(err)
    logger.error(err)
  }
}
