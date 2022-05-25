import { scheduleTask } from '../modules/queue'
import { CloudTaskServerEndpoints } from '../cloudTaskServer/cloudTaskServer'
import { ExtractValuesCloudTaskDTO } from '../types/merit'

type FieldData = {
  cleanerId: string
  fieldId: string,
  fieldName: string,
  fieldType: string,
}

export interface ISchedulerService {
  scheduleInitValuesExtraction: (orgId: string, fieldData: FieldData, meritTemplateIds: string[]) => Promise<void>
}

export class SchedulerService implements ISchedulerService {
  async scheduleInitValuesExtraction(orgId: string, fieldData: FieldData, meritTemplateIds: string[]) {
    for (const meritTemplateId of meritTemplateIds) {
      await scheduleTask<ExtractValuesCloudTaskDTO>(
        CloudTaskServerEndpoints.EXTRACT_FIELD_VALUES,
        {
          orgId,
          ...fieldData,
          meritTemplateId,
        }
      )
    }
  }
}
