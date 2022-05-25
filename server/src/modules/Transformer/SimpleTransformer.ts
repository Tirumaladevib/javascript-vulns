import { ValueTransformer } from './types'

export class SimpleTransformer implements ValueTransformer {
  private services: any

  constructor (services: any) {
    this.services = services
  }

  async transform (cleanerId: string, inputValue: string): Promise<{ updated: boolean, value: string }> {
    const mapping = await this.services.getValueMapping(cleanerId, inputValue)
    return mapping && mapping.outputValue ?
      { updated: true, value: mapping.outputValue } :
      { updated: false, value: inputValue }
  }
}
