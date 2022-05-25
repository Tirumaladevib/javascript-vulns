import { FastifyInstance, RequestGenericInterface } from 'fastify'
import { Cleaner } from '../entities/cleaner'
import { EventLog } from '../entities/eventLog'
import { FetcherRun } from '../entities/fetcherRun'
import { FetcherState } from '../entities/fetcherState'
import { User } from '../entities/user'
import { Repository } from 'typeorm'
import { Merit } from '../modules/merit'

import { CleanerService } from '../services/cleaner.service'
import { FetcherRunService } from '../services/fetcherRun.service'
import { FetcherStateService } from '../services/fetcherState.service'
import { EventLogService } from '../services/eventLog.service'
import { MappingService } from '../services/mapping.service'
import { Mapping } from '../entities/mapping'

declare global {
  interface FastifyInstanceExtension extends FastifyInstance {
    db: {
      cleaner: Repository<Cleaner>
      fetcherRun: Repository<FetcherRun>
      fetcherState: Repository<FetcherState>
      eventLog: Repository<EventLog>
      user: Repository<User>
      mapping: Repository<Mapping>
    }
    services: {
      cleaner: CleanerService
      fetcherRun: FetcherRunService
      fetcherState: FetcherStateService
      eventLog: EventLogService
      mapping: MappingService
    }
    modules: {
      merit: Merit
    }
  }
}

declare module 'fastify' {
  type UserType = {
    userId: string
    orgId: string
  }
}

interface FieldDetails {
  id: string,
  isGlobal: boolean,
  fieldName: string,
  fieldType: string,
  description: string
}

export interface Field {
  fieldId: string,
  enabled: boolean,
  inUse: boolean,
  required: boolean,
  valueForAllMerits?: any,
  name: string,
  details?: FieldDetails
}

export interface Template {
  id: string,
  title: string,
  description: string,
  canOnlyBeSentOnce: boolean,
  archived: boolean,
  editable: boolean,
  enabledFieldSettings: Field[],
  tagIds: []
}

type RecipientName = {
  firstName: string,
  lastName: string
}

export interface FieldValue {
  fieldId: string
  value: string
}

export interface IMerit {
  id: string,
  sendDateTime?: string,
  active: boolean,
  status: string,
  meritTemplateId: string,
  meritTemplateTitle: string,
  email: string,
  name?: RecipientName,
  fieldValues: FieldValue[],
  meritTemplateFieldValues?: FieldValue[],
  recipientMember?: any,
  editable?: boolean,
  permissionsGrantedToSender?: any,
  actor?: object,
  tagIds?: []
}

export interface IEdit {
  id: string,
  meritId: string,
  meritTemplateId?: string,
  status: string,
  fieldId: string,
  newValue: {
    fieldId: string,
    value: any
  }
}

export interface IQueue {
  add: (data: any) => void
}

export interface JobData {
  meritId: string
  newFieldValue: FieldValue
  oldFieldValue: FieldValue
  meta: JobMetaData
  retry?: number
}

export type ExtractValuesCloudTaskDTO = {
  orgId: string;
  cleanerId;
  meritTemplateId: string;
  fieldId: string;
  fieldName: string;
  fieldType: string
}

export type CreateMeritCloudTaskDTO = {
  meritId: string;
  newFieldValue: FieldValue;
  oldFieldValue: FieldValue;
  meta: JobMetaData;
  retry?: number
};

export type RollbackCloudTaskDTO = {
  cleaner: Cleaner;
  newValue: string;
}

export type CloudTaskHeaders = {
  'X-AppEngine-QueueName': string
  'X-AppEngine-TaskName': string
  'X-AppEngine-TaskRetryCount': number
  'X-AppEngine-TaskExecutionCount': number
  'X-AppEngine-TaskETA': number
}

export interface ExtractValuesCloudTaskRequestParam extends RequestGenericInterface {
  Body: ExtractValuesCloudTaskDTO
}

export interface MeritCloudTaskRequestParam extends RequestGenericInterface {
  Headers: CloudTaskHeaders
  Body: CreateMeritCloudTaskDTO
}

export interface RollbackCloudTaskRequestParam extends RequestGenericInterface {
  Body: RollbackCloudTaskDTO
}

export interface TransformationJobData {
  meritId: string
  newFieldValue: FieldValue
  oldFieldValue: FieldValue
  meta: JobMetaData
}

export interface MeritFieldJobData {
  fieldFilter: FieldFilter
  merit?: IMerit
}

export interface FieldFilter {
  fieldId: string
  fieldName: string
  fieldType: string
}

export interface MeritsFetcherMeta {
  jobType: string
  newFieldValue: FieldValue
  oldFieldValue: FieldValue
  jobMetaData: JobMetaData
}

export interface MeritMember {
  id: string
  name: {
    firstName: string
    lastName: string
  }
}

export type JobMetaData = {
  runId?: string
  orgId: string
  meritTemplateId?: string
  cleanerId: string
}
