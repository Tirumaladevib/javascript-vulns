import { AxiosResponse } from 'axios'
import { CreateProcessLogDTO } from '../entities/processLog'
import { EditFieldFn, LogJobDataFn } from '../modules/worker'
import { IMerit } from '../types/merit'
import { IProcessLogService } from '../services/processLog.service'
import { Merit } from '../modules/merit'
import { FindProcessLogsFn } from '../coordinators/RollbackCoordinator'

export const editField: EditFieldFn = async (orgId: string, meritId: string, fieldId: string, newValue: string): Promise<IMerit> => {
  const apiClient = new Merit()
  apiClient.orgId = orgId
  const api = await apiClient.getApiInstanceWithOrgTokenHeader()
  const res: AxiosResponse<IMerit> = await api.post(`merits/${meritId}/fields/${fieldId}`, { newValue })
  return res.data
}

export const logJobData =
  (processLogService: IProcessLogService): LogJobDataFn =>
    async (jobData: CreateProcessLogDTO) => {
      await processLogService.save(jobData)
    }

export const findProcessLogs =
  (processLogService: IProcessLogService): FindProcessLogsFn =>
    async (value, page) => {
    const pageSize = 100

    return processLogService.find(
      { newValue: value },
      {
        take: pageSize,
        skip: (page - 1) * pageSize,
        relations: ["cleaner"]
      }
    )
  }