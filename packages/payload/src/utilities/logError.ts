import type pino from 'pino'

import type { CMS } from '../types/index.js'

export const logError = ({ err, cms }: { err: unknown; cms: CMS }): void => {
  let level: false | pino.Level = 'error'

  if (
    err &&
    typeof err === 'object' &&
    'name' in err &&
    typeof err.name === 'string' &&
    typeof cms.config.loggingLevels[err.name as keyof typeof cms.config.loggingLevels] !==
      'undefined'
  ) {
    level = cms.config.loggingLevels[err.name as keyof typeof cms.config.loggingLevels]
  }

  if (level) {
    const logObject: { err?: unknown; msg?: unknown } = {}

    if (level === 'info') {
      logObject.msg = typeof err === 'object' && 'message' in err! ? err.message : 'Error'
    } else {
      logObject.err = err
    }

    cms.logger[level](logObject)
  }
}
