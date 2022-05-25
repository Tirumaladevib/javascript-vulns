import { CreateProcessLogDTO } from '../entities/processLog'
import { IMerit } from '../types/merit'
import { JobData } from '../types/merit'

export type EditFieldFn = (orgId: string, meritId: string, fieldId: string, value: string) => Promise<IMerit>
export type LogJobDataFn = (jobData: CreateProcessLogDTO) => Promise<void>

export const processMerit = (editField: EditFieldFn, logJobData: LogJobDataFn) => async (job: JobData) => {
  const merit = await editField(job.meta.orgId, job.meritId, job.newFieldValue.fieldId, job.newFieldValue.value)
  
  if (merit) {
    const logData: CreateProcessLogDTO = {
      meritId: merit.id,
      cleanerId: job.meta.cleanerId,
      fetcherRunId: job.meta.runId,
      fieldId: job.newFieldValue.fieldId,
      orgId: job.meta.orgId,
      oldValue: job.oldFieldValue.value,
      newValue: job.newFieldValue.value
    }
  
    await logJobData(logData)
  }
}
