'use client'

import { PopupList } from '@hanzo/cms-ui'

import { Banner } from '../Banner/index.js'

export const EditMenuItems = () => {
  return (
    <>
      <PopupList.ButtonGroup>
        <PopupList.Button>Custom Edit Menu Item</PopupList.Button>
        <Banner message="Another using a banner" />
        <div>Another in a plain div</div>
      </PopupList.ButtonGroup>
    </>
  )
}
