import config from "../config"
import { CloudTasksClient } from "@google-cloud/tasks"
import { sentry } from "../sentry"
import logger from '../logger'
import { CloudTaskServerEndpoints } from "../cloudTaskServer/cloudTaskServer"

enum HttpMethod {
  HTTP_METHOD_UNSPECIFIED = 0,
  POST = 1,
  GET = 2,
  HEAD = 3,
  PUT = 4,
  DELETE = 5,
}

export type CloudTaskConfig = {
  cloudTaskQueue: string,
  cloudTaskQueueProjectId: string,
  cloudTaskQueueZone: string,
}

const defaultConfig: CloudTaskConfig = {
  cloudTaskQueue: config.cloudTaskQueue,
  cloudTaskQueueProjectId: config.cloudTaskQueueProjectId,
  cloudTaskQueueZone: config.cloudTaskQueueZone,
}

export const createCloudTaskRequest = <PayloadType>(url: CloudTaskServerEndpoints, payload: PayloadType, scheduleTimeInSecondsFromNow?: number) => {
  const stringifiedPayload = JSON.stringify(payload)
  const task = {
    appEngineHttpRequest: {
      body: Buffer.from(stringifiedPayload).toString('base64'),
      httpMethod: HttpMethod.POST,
      relativeUri: url,
    },
    scheduleTime:
      scheduleTimeInSecondsFromNow ? 
      {
        seconds: (Date.now() / 1000) + scheduleTimeInSecondsFromNow
      }
      : undefined
  }

  return task
}

export const createQueueClient =
  (config: CloudTaskConfig) =>
    async <PayloadType>(url: CloudTaskServerEndpoints, payload: PayloadType, scheduleTimeInSecondsFromNow?: number) => {
      try {
        const client = new CloudTasksClient()
        const { cloudTaskQueue, cloudTaskQueueProjectId, cloudTaskQueueZone } = config
        const parent = client.queuePath(cloudTaskQueueProjectId, cloudTaskQueueZone, cloudTaskQueue)
        
        const task = createCloudTaskRequest(url, payload, scheduleTimeInSecondsFromNow)
        await client.createTask({ parent, task })
      } catch (err) {
        sentry.captureException(err)
        logger.error(err)
      }
    }

export const scheduleTask = createQueueClient(defaultConfig)