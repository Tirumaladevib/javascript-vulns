import config from './config'
import * as Sentry from '@sentry/node'

const appHostEnvironment = process.env.NODE_ENV
const isRemote = appHostEnvironment === 'production' || appHostEnvironment === 'staging'

Sentry.init({
  dsn: config.sentryDSN,
  environment: appHostEnvironment || 'development',
  enabled: isRemote
})

export const sentry = Sentry
