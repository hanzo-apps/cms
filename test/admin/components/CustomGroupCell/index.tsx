'use client'

import type { DefaultCellComponentProps } from '@hanzo/cms'

import React from 'react'

export const CustomGroupCell: React.FC<DefaultCellComponentProps> = (props) => {
  return <div>{`Custom group cell: ${props?.rowData?.title || 'No data'}`}</div>
}
