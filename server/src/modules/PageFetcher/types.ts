export type MeritsCheckpointData = {
  type: 'merits'
  id: string
  orgId: string
  retries: number
  meritTemplateId: string
  lastCursor: string
}

export type ValuesCheckpointData = {
  type: 'values'
  id: string
  orgId: string
  retries: number
  meritTemplateId: string
  lastCursor: string
}

export type EditsCheckpointData = {
  type: 'edits'
  id: string
  orgId: string
  retries: number
  lastCursor: string
}

export type CheckpointData = MeritsCheckpointData | EditsCheckpointData | ValuesCheckpointData

export interface Checkpoint {
  // Initialize
  // Load
  getData: () => CheckpointData
  getCursor: () => string
  update: (cursor: string) => Promise<void>
}

export interface PageFetcher {
  getNextPage: () => Promise<any>
  hasNextPage: () => boolean
  updateCheckpoint: () => Promise<void>
}