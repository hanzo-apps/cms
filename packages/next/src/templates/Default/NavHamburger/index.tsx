'use client'
import { Hamburger, useNav } from '@hanzo/cms-ui'
import React from 'react'

export const NavHamburger: React.FC = () => {
  const { navOpen } = useNav()
  return <Hamburger closeIcon="collapse" isActive={navOpen} />
}
