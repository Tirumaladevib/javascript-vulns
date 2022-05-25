import { Repository, DeepPartial, DeleteResult, FindOneOptions, FindManyOptions } from 'typeorm'
import { FetcherState, IFetcherState } from '../entities/fetcherState'

export class FetcherStateService {
  private readonly fetcherStateRepository: Repository<FetcherState>
  constructor (r: Repository<FetcherState>) {
    this.fetcherStateRepository= r
  }

  async save (fetcherStates: IFetcherState[]): Promise<IFetcherState[]> {
    const results: IFetcherState[] = await this.fetcherStateRepository.save(fetcherStates)
    return results
  }

  async findOne (options?: DeepPartial<FetcherState>, query?: FindOneOptions<FetcherState>): Promise<FetcherState> {
    const fetcherState: FetcherState = await this.fetcherStateRepository.findOne({ ...options, ...query })
    return fetcherState 
  }

  async findAll (orgId: string, query?: FindManyOptions<FetcherState>): Promise<[FetcherState[], number]> {
    const [fetcherStates, count] = await this.fetcherStateRepository.findAndCount({
      where: { orgId },
      ...query,
    })
    return [ fetcherStates, count ] 
  }

  async remove (options?: DeepPartial<FetcherState>) {
    const result: DeleteResult = await this.fetcherStateRepository.delete(options)
    return result
  }
}
