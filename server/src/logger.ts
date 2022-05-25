import os from 'os';
import winston from "winston";

enum LogLevel {
  error = 'error', 
  warn = 'warn', 
  info = 'info', 
  http = 'http',
  verbose = 'verbose', 
  debug = 'debug', 
  silly = 'silly'
}

const appHostEnvironment = process.env.NODE_ENV
const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, {
      message: info.stack
    });
  }
  return info;
});

const getLogLevel = (env: string): LogLevel => {
  switch (env) {
    case 'development':
      return LogLevel.debug
    case 'test':
      return LogLevel.error
    default:
      return LogLevel.info
  }
}

const logger = winston.createLogger({
  level: getLogLevel(appHostEnvironment),
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => JSON.stringify({
      level,
      time: Date.now(),
      pid: process.pid,
      hostname: os.hostname(),
      msg: message
    }))
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;