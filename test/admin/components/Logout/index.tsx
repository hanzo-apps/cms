'use client'

import { LogOutIcon, useConfig } from '@hanzo/cms-ui'
import React from 'react'

export const Logout: React.FC = () => {
  const {
    config: {
      admin: {
        routes: { logout: logoutRoute },
      },
      routes: { admin },
    },
  } = useConfig()

  return (
    <a href={`${admin}${logoutRoute}#custom`}>
      <LogOutIcon />
    </a>
  )
}
