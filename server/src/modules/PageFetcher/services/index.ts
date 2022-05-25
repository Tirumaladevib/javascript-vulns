import { EditsCheckpointData } from '../types'
import { MeritsCheckpointData } from '../types'
import { Merit } from '../../merit'
import { FetcherStateService } from '../../../services/fetcherState.service'
import logger from '../../../logger'

const delay = time => new Promise(resolve => setTimeout(resolve, time))

// TODO: Extract retry logic to MeritPageFetcher class
export const getMeritsOnCursor = async (service: FetcherStateService, orgId: string, meritTemplateId: string, lastCursor: string, retry: number = 1) => {
  try {
    const meritApiClient = new Merit(service)
    meritApiClient.orgId = orgId
    const response = await meritApiClient.get(`/orgs/${orgId}/merits?limit=1&merittemplate_id=${meritTemplateId}${lastCursor ? '&starting_after=' + lastCursor : ''}`)

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
    const response = await getMeritsOnCursor(service, orgId, meritTemplateId, lastCursor, retry + 1)
    return response
  }
}

export const getCheckpoint = async (orgId: string, meritTemplateId?: string): Promise<MeritsCheckpointData | EditsCheckpointData> => {
  return null
}

export const createCheckpoint = async (data: { type: 'merits' | 'edits', orgId: string, meritTemplateId?: string, retries: number, lastCursor: string }): Promise<MeritsCheckpointData | EditsCheckpointData> => {
  return {
    id: 'dummy_id',
    type: data.type,
    orgId: data.orgId,
    meritTemplateId: data.meritTemplateId,
    retries: 1,
    lastCursor: data.lastCursor
  }
}

export const updateCheckpoint = async (data: MeritsCheckpointData | EditsCheckpointData) => {
  logger.info('Updating checkpoint', data)
}
