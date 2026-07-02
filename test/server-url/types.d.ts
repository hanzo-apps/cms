import type { RequestContext as OriginalRequestContext } from '@hanzo/cms'

declare module '@hanzo/cms' {
  // Create a new interface that merges your additional fields with the original one
  export interface RequestContext extends OriginalRequestContext {
    myObject?: string
    // ...
  }
}
