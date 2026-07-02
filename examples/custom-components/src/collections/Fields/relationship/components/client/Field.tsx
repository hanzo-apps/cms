'use client'
import type { RelationshipFieldClientComponent } from @hanzo/cms'from 

import { RelationshipField } from '@hanzo/cms-ui'
import React from 'react'

export const CustomRelationshipFieldClient: RelationshipFieldClientComponent = (props) => {
  return <RelationshipField {...props} />
}
