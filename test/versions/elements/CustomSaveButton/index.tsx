'use client'
import { PublishButton } from '@hanzo/cms-ui'
import * as React from 'react'

import classes from './index.module.scss'

export function CustomPublishButton() {
  return (
    <div className={classes.customButton}>
      <PublishButton />
    </div>
  )
}
