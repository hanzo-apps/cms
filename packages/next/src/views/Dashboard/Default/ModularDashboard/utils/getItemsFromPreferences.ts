import type { BaseCMS, TypedUser } from '@hanzo/cms'

import { PREFERENCE_KEYS } from '@hanzo/cms/shared'

import type { WidgetItem } from '../index.client.js'

import { getPreferences } from '../../../../../utilities/getPreferences.js'

export async function getItemsFromPreferences(
  cms: BaseCMS,
  user: TypedUser,
): Promise<null | WidgetItem[]> {
  const savedPreferences = await getPreferences(
    PREFERENCE_KEYS.DASHBOARD_LAYOUT,
    cms,
    user.id,
    user.collection,
  )
  if (
    !savedPreferences?.value ||
    typeof savedPreferences.value !== 'object' ||
    !('layouts' in savedPreferences.value)
  ) {
    return null
  }
  return savedPreferences.value.layouts as null | WidgetItem[]
}
