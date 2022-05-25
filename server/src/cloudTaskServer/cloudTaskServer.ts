import fastify, { FastifyReply, FastifyRequest } from "fastify"
import logger from "../logger"
import { sentry } from "../sentry"
import { startEditsProcessing, startNewMeritsProcessing, startRollback } from '../coordinators'
import { startValueExtraction } from "../coordinators"
import { EditFieldFn, LogJobDataFn, processMerit } from "../modules/worker"
import { ExtractValuesCloudTaskRequestParam, JobData, MeritCloudTaskRequestParam, RollbackCloudTaskRequestParam } from "../types/merit"
import { findFieldNameCaseInsensitive } from './utils'
import { FindProcessLogsFn } from "../coordinators/RollbackCoordinator"

export type CloudTaskServerConfig = {
  maxNumberOfJobRetries: number
}

export type CloudTaskServerServices = {
  editField: EditFieldFn
  logJobData: LogJobDataFn
  scheduleRetryJob: (data: JobData) => Promise<void>
  logFailedJob: (data: JobData) => Promise<void>
  findProcessLogs: FindProcessLogsFn
}

export enum CloudTaskServerEndpoints {
  HEALTH = '/health',
  EXTRACT_FIELD_VALUES = '/extract-field-values',
  PROCESS_MERIT = '/process-merit',
  PROCESS_ROLLBACK = '/process-rollback',
  PROCESS_NEW_MERITS = '/process-new-merits',
  PROCESS_EDITS = '/process-edits'
}

export function createServer(config: CloudTaskServerConfig, services: CloudTaskServerServices) {
  const server = fastify({
    ignoreTrailingSlash: true,
  })

  server.addContentTypeParser("application/octet-stream", { parseAs: 'string' }, (request, payload, done) => {
    const dataInString = payload.toString('utf-8')
    const jsonBody = JSON.parse(dataInString)
    done(null, jsonBody)
  })

  server.get(CloudTaskServerEndpoints.HEALTH, async (req: FastifyRequest, reply: FastifyReply) => {
    reply.status(200).send("OK")
  })

  server.post(CloudTaskServerEndpoints.EXTRACT_FIELD_VALUES, async (req: FastifyRequest<ExtractValuesCloudTaskRequestParam>, reply: FastifyReply) => {
    try {
      const { orgId, cleanerId, fieldId, fieldName, fieldType, meritTemplateId } = req.body
      if (orgId && cleanerId && fieldId && fieldName && fieldType && meritTemplateId) {
        startValueExtraction(orgId, { cleanerId, fieldId, fieldName, fieldType }, meritTemplateId)
        reply.status(200).send("OK")
      } else {
        reply.status(400).send("Bad request")
      }
    } catch (err) {
      logger.error(err)
      reply.status(500).send("Error")
    }
  })

  server.post(CloudTaskServerEndpoints.PROCESS_MERIT, async (req: FastifyRequest<MeritCloudTaskRequestParam>, reply: FastifyReply) => {
    try {
      logger.info(`/process-merit endpoint called with: ${JSON.stringify(req.body)}`)

      await processMerit(services.editField, services.logJobData)(req.body)
      reply.status(200).send("OK")
    } catch (err) {
      logger.error(err)
      if (err && err.response && err.response.status) {
        if (err.response.status === 400) {
          reply.status(200).send(err.response.data)
        }

        const taskExecutionCountFieldName = findFieldNameCaseInsensitive(req.headers, 'X-AppEngine-TaskExecutionCount')
        let retryCount = taskExecutionCountFieldName ? parseInt(req.headers[taskExecutionCountFieldName] as string) : 0

        if (retryCount + 1 >= config.maxNumberOfJobRetries) {
          try {
            if (!req.body.retry) {
              await services.scheduleRetryJob(req.body)
              return reply.status(200).send('Scheduled a retry for later')
            } else {
              logger.info(`Logging job to database and dismissing processing: ${JSON.stringify(req.body)}`)
              
              await services.logFailedJob(req.body)
              reply.status(200).send('Logged job to database and dismissed further processing')
            }
          } catch (err2) {
            logger.error(err2)
            sentry.captureException(err2)
            reply.status(500).send("Error")
          }
        }
        reply.status(err.response.status).send(err.response.data)
      }
      reply.status(500).send("Error")
    }
  })

  server.post(CloudTaskServerEndpoints.PROCESS_ROLLBACK, async (req: FastifyRequest<RollbackCloudTaskRequestParam>, reply: FastifyReply) => {
    try {
      logger.info(`Rollback: ${JSON.stringify(req.body)}`)

      const { cleaner, newValue  } = req.body
      startRollback(cleaner.orgId, cleaner.id, newValue)

      reply.status(200).send("OK")
    } catch (err) {
      logger.error(err)
      reply.status(500).send("Error")
    }
  })

  server.post(CloudTaskServerEndpoints.PROCESS_NEW_MERITS, async (req: FastifyRequest, reply: FastifyReply) => {
    startNewMeritsProcessing()
    reply.status(200).send("OK")
  })

  server.post(CloudTaskServerEndpoints.PROCESS_EDITS, async (req: FastifyRequest, reply: FastifyReply) => {
    startEditsProcessing()
    reply.status(200).send("OK")
  })

  return server
}
