import { Repository, DeepPartial, DeleteResult, FindManyOptions } from 'typeorm'
import { FetcherRun, IFetcherRun } from '../entities/fetcherRun'

export class FetcherRunService {
  private readonly fetcherRunRepository: Repository<FetcherRun>
  constructor (r: Repository<FetcherRun>) {
    this.fetcherRunRepository = r
  }

  async save (fetcherRun: IFetcherRun): Promise<FetcherRun> { // this can be used for both create and update
    const result: FetcherRun = await this.fetcherRunRepository.save(fetcherRun)
    return result
  }

  async findOne (options?: DeepPartial<FetcherRun>): Promise<FetcherRun> {
    const fetcherRun: FetcherRun = await this.fetcherRunRepository.findOne(options)
    return fetcherRun 
  }

  async findAll (orgId: string, query?: FindManyOptions<FetcherRun>): Promise<[FetcherRun[], number]> {
    const [fetcherRuns, count] = await this.fetcherRunRepository.findAndCount({
      where: { orgId },
      ...query,
    })
    return [ fetcherRuns, count ] 
  }

  async remove (options?: DeepPartial<FetcherRun>) {
    const result: DeleteResult = await this.fetcherRunRepository.delete(options)
    return result
  }
}
