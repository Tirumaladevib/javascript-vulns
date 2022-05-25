import { Repository, DeepPartial, DeleteResult, FindManyOptions } from 'typeorm'
import { EventLog, IEventLog } from '../entities/eventLog'

export class EventLogService {
  private readonly repository: Repository<EventLog>
  constructor (r: Repository<EventLog>) {
    this.repository = r
  }

  async save (event: IEventLog): Promise<EventLog> {
    const result: EventLog = await this.repository.save(event)
    return result
  }

  async findOne (options?: DeepPartial<EventLog>): Promise<EventLog> {
    const event: EventLog = await this.repository.findOne(options)
    return event
  }

  async findAll (orgId: string, query?: FindManyOptions<EventLog>): Promise<[EventLog[], number]> {
    const [eventLogs, count] = await this.repository.findAndCount({
      where: { orgId },
      ...query,
    })
    return [ eventLogs, count ] 
  }

  async remove (options?: DeepPartial<EventLog>) {
    const result: DeleteResult = await this.repository.delete(options)
    return result
  }
}
