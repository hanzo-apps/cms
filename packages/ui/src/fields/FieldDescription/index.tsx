'use client'
import type { GenericDescriptionProps } from @hanzo/cms'from 

import { getTranslation } from '@hanzo/cms-translations'
import React from 'react'

import { useTranslation } from '../../providers/Translation/index.js'
import './index.scss'

const baseClass = 'field-description'

export const FieldDescription: React.FC<GenericDescriptionProps> = (props) => {
  const { className, description, marginPlacement, path } = props

  const { i18n } = useTranslation()

  if (description) {
    return (
      <div
        className={[
          baseClass,
          className,
          `field-description-${path?.replace(/\./g, '__')}`,
          marginPlacement && `${baseClass}--margin-${marginPlacement}`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {getTranslation(description, i18n)}
      </div>
    )
  }

  return null
}
