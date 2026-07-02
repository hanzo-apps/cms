'use client'

import type { DefaultCellComponentProps } from '@hanzo/cms'

import React from 'react'

export const CustomCell: React.FC<DefaultCellComponentProps> = (props) => {
  return (
    <span id="custom-richtext-cell">{`Custom cell: ${props?.cellData ? 'has data' : 'no data'}`}</span>
  )
}
