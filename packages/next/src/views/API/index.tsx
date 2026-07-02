import type { DocumentViewServerProps } from '@hanzo/cms'

import React from 'react'

import { APIViewClient } from './index.client.js'

export function APIView(props: DocumentViewServerProps) {
  return <APIViewClient />
}
