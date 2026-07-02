'use client'
import type { TypedUser } from @hanzo/cms'from 

import {
  Button,
  ConfirmationModal,
  toast,
  useConfig,
  useModal,
  useTranslation,
} from '@hanzo/cms-ui'
import { formatAdminURL } from @hanzo/cms'from 
import * as qs from 'qs-esm'
import { Fragment, useCallback } from 'react'

const confirmResetModalSlug = 'confirm-reset-modal'

export const ResetPreferences: React.FC<{
  readonly user?: TypedUser
}> = ({ user }) => {
  const { openModal } = useModal()
  const { t } = useTranslation()
  const {
    config: {
      routes: { api: apiRoute },
    },
  } = useConfig()

  const handleResetPreferences = useCallback(async () => {
    if (!user) {
      return
    }

    const stringifiedQuery = qs.stringify(
      {
        depth: 0,
        where: {
          'user.value': {
            equals: user.id,
          },
        },
      },
      { addQueryPrefix: true },
    )

    try {
      const res = await fetch(
        formatAdminURL({
          apiRoute,
          path: `/payload-preferences${stringifiedQuery}`,
        }),
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'DELETE',
        },
      )

      const json = await res.json()
      const message = json.message

      if (res.ok) {
        toast.success(message)
      } else {
        toast.error(message)
      }
    } catch (_err) {
      // swallow error
    }
  }, [apiRoute, user])

  return (
    <Fragment>
      <div>
        <Button buttonStyle="secondary" onClick={() => openModal(confirmResetModalSlug)}>
          {t('general:resetPreferences')}
        </Button>
      </div>
      <ConfirmationModal
        body={t('general:resetPreferencesDescription')}
        confirmingLabel={t('general:resettingPreferences')}
        heading={t('general:resetPreferences')}
        modalSlug={confirmResetModalSlug}
        onConfirm={handleResetPreferences}
      />
    </Fragment>
  )
}
