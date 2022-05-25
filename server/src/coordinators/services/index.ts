import { IFetcherState } from "../../entities/fetcherState"
import { Mapping } from "../../entities/mapping"
import { Merit } from "../../modules/merit"
import { FetcherStateService } from "../../services/fetcherState.service"
import { MappingService } from "../../services/mapping.service"
import logger from "../../logger"
import { sentry } from "../../sentry"
import moment from "moment"
import { scheduleTask } from "../../modules/queue"
import { JobData } from "../../types/merit"
import { CloudTaskServerEndpoints } from "../../cloudTaskServer/cloudTaskServer"
import { IProcessLogService } from "../../services/processLog.service"
import { FindProcessLogsFn } from "../RollbackCoordinator"

export const initGetCheckpointService = (service: FetcherStateService) => async (type: 'merits' | 'edits' | 'values', orgId: string, meritTemplateId?: string): Promise<IFetcherState> => {
  const fetcherState = meritTemplateId ?
    await service.findOne({ type, orgId, meritTemplateId }) :
    await service.findOne({ type, orgId })

  return fetcherState
}

export const initCreateCheckpointService = (service: FetcherStateService) => async (data: { type: 'merits' | 'edits' | 'values', orgId: string, meritTemplateId?: string, retries: number, lastCursor: string }): Promise<IFetcherState[]> => {
  const initCheckpointData = {
    type: data.type,
    orgId: data.orgId,
    meritTemplateId: data.meritTemplateId,
    retries: 1,
    lastCursor: data.lastCursor || ''
  }

  return service.save([initCheckpointData])
}

export const initUpdateCheckpointService = (service: FetcherStateService) => async (data: any) => {
  await service.save(data)
}

export const initGetValueMappingService = (service: MappingService) => async (cleanerId: string, inputValue: string) => {
  return service.findOne(cleanerId, inputValue)
}

export const initSaveValueMappingsService = (service: MappingService) => async (mappings: Mapping[]) => {
  return service.create(mappings)
}

const delay = time => new Promise(resolve => setTimeout(resolve, time, ''))

// TODO: Extract retry logic to MeritPageFetcher class
export const getMeritsOnCursor = async (orgId: string, meritTemplateId: string, cursor: string, retry: number = 1) => {
  try {
    const client = new Merit()
    client.orgId = orgId
    const meritApiClient = await client.getApiInstanceWithOrgTokenHeader()
    const response = await meritApiClient.get(`/orgs/${orgId}/merits?limit=100&merittemplate_id=${meritTemplateId}${cursor ? '&starting_after=' + cursor : ''}`)

    return response.data
  } catch (err) {
    logger.error(err)
    if (!(err.response && err.response.status >= 429)) throw err
    if (retry > 3) throw new Error('Max number of retries done.')
    if (err.response.status === 429) {
      logger.error('Hitting rate limit, delaying one minute until next attempt')
      await delay(60000)
    } else {
      await delay(4000 * retry)
    }
    const response = await getMeritsOnCursor(orgId, meritTemplateId, cursor, retry + 1)
    return response
  }
}

export const getEditsOnCursor = async (orgId: string, cursor: string, retry: number = 1) => {
  try {
    const client = new Merit()
    client.orgId = orgId
    const meritApiClient = await client.getApiInstanceWithOrgTokenHeader()
    const response = await meritApiClient.get(`/orgs/${orgId}/meritedits?limit=100&${cursor ? '&starting_after=' + cursor : ''}`)

    return response.data
  } catch (err) {
    logger.error(err)
    if (!(err.response && err.response.status >= 429)) throw err
    if (retry > 3) throw new Error('Max number of retries done.')
    if (err.response.status === 429) {
      logger.error('Hitting rate limit, delaying one minute until next attempt')
      await delay(60000)
    } else {
      await delay(4000 * retry)
    }
    const response = await getEditsOnCursor(orgId, cursor, retry + 1)
    return response
  }
}

export const getTodaysFirstEdit = async (orgId: string, ) => {
  try {
    const client = new Merit()
    client.orgId = orgId
    const meritApiClient = await client.getApiInstanceWithOrgTokenHeader()
    const response = await meritApiClient.get(`/orgs/${orgId}/meritedits?limit=1&${moment().format('YYYY-MM-DD')}`)
    return response.data
  } catch (err) {
    logger.error(err)
    sentry.captureException(err)
  }
}

// TODO Check whether there is paging on this endpoint and add looping through pages to collect all fields
export const getOrgFields = async (orgId: string) => {
  try {
    const client = new Merit()
    client.orgId = orgId
    const meritApiClient = await client.getApiInstanceWithOrgTokenHeader()
    const response = await meritApiClient.get(`/orgs/${orgId}/fields`)
    return response.data
  } catch (err) {
    logger.error(err)
    throw err
  }
}

export const addJobToCloudTask = async (data: JobData) => {
  logger.info('Transform job added for merit:', data.meritId)
  await scheduleTask<JobData>(CloudTaskServerEndpoints.PROCESS_MERIT, { ...data })
}

export const addRollbackJobToCloudTask = async (data: JobData) => {
  logger.info(`Add rollback job to queue: ${JSON.stringify(data)}`)

  await scheduleTask<JobData>(
    CloudTaskServerEndpoints.PROCESS_ROLLBACK,
    data
  )
}

export const initFindProcessLogs =
  (processLogService: IProcessLogService) =>
    (pageSize: number): FindProcessLogsFn => 
      async (value, page) => processLogService.find(
        { newValue: value },
        {
          take: pageSize,
          skip: (page - 1) * pageSize,
          relations: ["cleaner"]
        }
      )
