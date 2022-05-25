import { Repository, FindManyOptions } from 'typeorm'
import { IMapping, Mapping } from '../entities/mapping'

export class MappingService {
  private readonly mappingRepository: Repository<Mapping>
  constructor(r: Repository<Mapping>) {
    this.mappingRepository = r
  }

  async create(mappings: IMapping[]) {
    const queryBuilder = this.mappingRepository.createQueryBuilder('Mapping')

    const result = await queryBuilder
      .insert()
      .into(Mapping)
      .values(mappings)
      .onConflict('DO NOTHING')
      .execute()

    return result.identifiers
  }


  async save(mappings: IMapping[]): Promise<IMapping[]> {
    const results: IMapping[] = await this.mappingRepository.save(mappings)
    return results
  }

  async findOne(cleanerId: string, inputValue: string): Promise<Mapping> {
    const mapping: Mapping = await this.mappingRepository.findOne({ where: { cleanerId, inputValue } })
    return mapping
  }

  async findAll(cleanerId: string, query?: FindManyOptions<Mapping>): Promise<[Mapping[], number]> {
    const [mapping, count]: [Mapping[], number] = await this.mappingRepository.findAndCount({ where: { cleanerId }, ...query })
    return [mapping, count]
  }

  async searchAll(cleanerId: string, searchTerm: string, query?: FindManyOptions<Mapping>): Promise<[Mapping[], number]> {
    const result = await this.mappingRepository
      .createQueryBuilder('mapping')
      .select()
      .where('"cleanerId"=:cleanerId', { cleanerId })
      .andWhere('"inputValue" ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .limit(query.take)
      .offset(query.skip)
      .getManyAndCount()

    return result
  }
}
