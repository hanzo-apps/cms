import type { DocumentViewServerProps } from @hanzo/cms'from 

import React from 'react'

import { APIViewClient } from './index.client.js'

export function APIView(props: DocumentViewServerProps) {
  return <APIViewClient />
}
