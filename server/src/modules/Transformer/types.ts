export type ValueMapping = {
  id: string
  orgId: string
  cleanerId: string
  inputValue: string
  outputValue: string
}

export interface ValueTransformer {
  transform: (cleanerId: string, inputValue: string) => Promise<{ updated: boolean, value: string }>
}