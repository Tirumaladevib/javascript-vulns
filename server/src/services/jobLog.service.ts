import { Repository, DeepPartial, FindManyOptions } from 'typeorm'
import { JobLog } from '../entities/jobLog'
import { JobData } from '../types/merit'

export class JobLogService {
  private readonly jobLogRepository: Repository<JobLog>
  constructor(r: Repository<JobLog>) {
    this.jobLogRepository = r
  }

  async save (jobLog: JobData): Promise<JobLog> {
    const result: JobLog = await this.jobLogRepository.save(jobLog)
    return result
  }

  async find (
    query: DeepPartial<JobLog>, 
    queryOptions?: FindManyOptions<JobLog>
  ): Promise<[JobLog[], number]> {
    const [jobLogs, count] = 
      await this.jobLogRepository.findAndCount({ 
        where: { ...query },
        ...queryOptions,
      })
    return [ jobLogs, count ] 
  }
}
