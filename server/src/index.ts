import fastify, { FastifyReply } from 'fastify'
import fastifyCookie from 'fastify-cookie'
import cors from 'fastify-cors'
import fastifyJwt from 'fastify-jwt'
import config from './config'
import connect from './db'
import { sentry } from './sentry'
import logger from './logger'
import { startEditsProcessing, startNewMeritsProcessing } from './coordinators'


async function startServer() {
  try {
    await connect()
  } catch (error: unknown) {
    sentry.captureException(error)
    logger.error(error)
    process.exit(1)
  }

  const f = fastify({ logger: true })
  const port = config.port

  f.register(fastifyCookie, { secret: config.cookieSecretKey })
  f.register(fastifyJwt, {
    cookie: {
      cookieName: config.cookieName,
      signed: true,
    },
    secret: config.jwtSecretKey,
  })

  f.register(cors, {
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['DELETE', 'PATCH', 'POST', 'GET'],
    origin: config.frontendUrl
  })

  f.register(require('./plugins/resources'))
  f.register(require('./plugins/auth'), {
    prefix: '/api'
  })
  f.register(require('./plugins/cleaners'), {
    prefix: '/api'
  })
  f.register(require('./plugins/fetcherState'), {
    prefix: '/api'
  })
  f.register(require('./plugins/fetcherRun'), {
    prefix: '/api'
  })
  f.register(require('./plugins/eventLog'), {
    prefix: '/api'
  })
  f.register(require('./plugins/merit'), {
    prefix: '/api'
  })
  f.register(require('./plugins/mappings'), {
    prefix: '/api'
  })

  f.get('/api/health', (request, reply) => {
    reply.send({ message: 'Ok' })
  })

  f.post("/api/process-new-merits", async (_, reply: FastifyReply) => {
    startNewMeritsProcessing();
    reply.status(200).send("OK");
  });

  f.post("/api/process-edits", async (_, reply: FastifyReply) => {
    startEditsProcessing();
    reply.status(200).send("OK");
  });

  f.listen(port, (err, address) => {
    if (err) {
      f.log.error(err)
      process.exit(1)
    }
    f.log.info(`server listening on ${address}`)
  })
}

startServer()
