require('dotenv').config()

interface Config {
  appId?: string
  appOrgId?: string
  appSecret?: string
  cookieName?: string
  cookieSecretKey?: string
  cloudTaskQueue?: string
  cloudTaskQueueProjectId?: string
  cloudTaskQueueZone?: string
  gcpProjectId?: string
  gcpZone?: string
  jwtSecretKey?: string
  meritBaseUrl?: string
  port?: number
  dbHost?: string
  dbPort?: number
  dbName?: string
  dbUser?: string
  dbPass?: string
  redis?: string
  sentryDSN?: string
  frontendUrl?: string
}

const defaultConfig: Config = {
  port: 3000,
  cookieName: 'clientcookie',
  frontendUrl: 'http://localhost:8000',
  dbHost: 'localhost',
  dbPort: 5432,
}

const configEnvVarMap = {
  dbHost: 'POSTGRES_HOST',
  dbPort: 'POSTGRES_PORT',
  dbName: 'POSTGRES_DB',
  dbUser: 'POSTGRES_USERNAME',
  dbPass: 'POSTGRES_PASSWORD',
  redis: 'REDIS',
  cloudTaskQueue: 'CLOUD_TASK_QUEUE',
  cloudTaskQueueProjectId: 'CLOUD_TASK_QUEUE_PROJECT_ID',
  cloudTaskQueueZone: 'CLOUD_TASK_QUEUE_ZONE',
  cookieSecretKey: 'COOKIE_SECRET_KEY',
  cookieName: 'COOKIE_NAME',
  gcpProjectId: 'GCP_PROJECT_ID',
  gcpZone: 'GCP_ZONE',
  jwtSecretKey: 'JWT_SECRET_KEY',
  meritBaseUrl: 'MERIT_BASE_URL',
  appOrgId: 'APP_ORG_ID',
  appId: 'APP_ID',
  appSecret: "APP_SECRET",
  port: "PORT",
  sentryDSN: "SENTRY_DSN",
  frontendUrl: "FRONT_END_URL",
}

const getConfig = (): Config => {
  let config: Config = {}
  Object.keys(configEnvVarMap).forEach(key => {
    const val = process.env[configEnvVarMap[key]]
    if (val) {
      config[key] = val
    }
  })
  return { ...defaultConfig, ...config }
}

export default getConfig()
