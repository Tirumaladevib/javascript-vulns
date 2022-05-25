import { ValueMapping } from '../types'

export const getValueMapping = async (cleanerId: string, inputValue: string): Promise<ValueMapping> => {
  return Promise.resolve({ id: 'dummy', orgId: '5cdb11a5efbfe200090b6748', cleanerId, inputValue, outputValue: 'test' })
}