import { Repository, DeepPartial, FindManyOptions } from 'typeorm'
import { ProcessLog, CreateProcessLogDTO } from '../entities/processLog'

export interface IProcessLogService {
  save: (processLog: CreateProcessLogDTO) => Promise<ProcessLog>,
  find: (query: DeepPartial<ProcessLog>, queryOptions?: FindManyOptions<ProcessLog>) => Promise<[ProcessLog[], number]>
}

export class ProcessLogService implements IProcessLogService {
  private readonly processLogRepository: Repository<ProcessLog>
  constructor(r: Repository<ProcessLog>) {
    this.processLogRepository = r
  }

  async save (processLog: CreateProcessLogDTO): Promise<ProcessLog> {
    const result: ProcessLog = await this.processLogRepository.save(processLog)
    return result
  }

  async find (
    query: DeepPartial<ProcessLog>, 
    queryOptions?: FindManyOptions<ProcessLog>
  ): Promise<[ProcessLog[], number]> {
    const [processLogs, count] = 
      await this.processLogRepository.findAndCount({ 
        where: { ...query },
        ...queryOptions,
      })
    return [ processLogs, count ] 
  }
}
