import config from './config'
import { Connection, getConnectionManager, ConnectionOptions, createConnection } from 'typeorm'
import { sentry } from './sentry'
import logger from './logger'

const connect = async (module: string = 'api'): Promise<Connection> => {
  try {
    let connection: Connection
    const connectionManager = getConnectionManager()
    const hasConnection = connectionManager.has(module);

    if (hasConnection) {
      connection = connectionManager.get(module)

      if (!connection.isConnected) {
        connection = await connection.connect()
      }
    } else {
      const connectionOptions: ConnectionOptions = {
        name: module,
        cli: {
          entitiesDir: `${__dirname}/entities`,
          migrationsDir: `${__dirname}/migrations`,
        },
        entities: [`${__dirname}/entities/*`],
        logging: false,
        migrations: [`${__dirname}/migrations/**/*`],
        migrationsRun: true,
        type: "postgres",
        database: config.dbName,
        host: config.dbHost,
        password: config.dbPass,
        port: config.dbPort,
        username: config.dbUser,
      }

      connection = await createConnection(connectionOptions);
    }

    logger.info(`[${module}] Connection to database established!`)

    return connection
  } catch (err) {
    sentry.captureException(err)
    logger.error(err)
    process.exit(1)
  }
}

export default connect
