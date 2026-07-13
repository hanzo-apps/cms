import { APIError } from './APIError.js'

export class MissingCollectionLabel extends APIError {
  constructor() {
    super('cms.config.collection object is missing label')
  }
}
