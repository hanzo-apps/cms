import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import { TypedLocale } from '@hanzo/cms'

export async function Header({ locale }: { locale: TypedLocale }) {
  const header = await getCachedGlobal('header', 1, locale)()

  return <HeaderClient header={header} />
}
