import type { BasePayload, TypedUser } from '@hanzo/cms'

import { PREFERENCE_KEYS } from '@hanzo/cms/shared'

import type { WidgetItem } from '../index.client.js'

import { getPreferences } from '../../../../../utilities/getPreferences.js'

export async function getItemsFromPreferences(
  payload: BasePayload,
  user: TypedUser,
): Promise<null | WidgetItem[]> {
  const savedPreferences = await getPreferences(
    PREFERENCE_KEYS.DASHBOARD_LAYOUT,
    payload,
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
