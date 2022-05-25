declare global {
  namespace NodeJS {
    // eslint-disable-next-line
    interface ProcessEnv {
      readonly REACT_APP_HOST_ENV: string;
      readonly REACT_APP_API_BASE_URL: string;
      readonly SENTRY_DSN: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};