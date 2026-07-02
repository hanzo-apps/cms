'use client'

import { PopupList } from '@hanzo/cms-ui'

import { Banner } from '../Banner/index.js'

export const ListMenuItemsExample = () => {
  return (
    <>
      <PopupList.ButtonGroup>
        <Banner message="listMenuItems" />
        <Banner message="Many of them" />
        <Banner message="Ok last one" />
      </PopupList.ButtonGroup>
    </>
  )
}
