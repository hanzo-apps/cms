import type { WithServerSidePropsComponent } from '@hanzo/cms'

import { isReactServerComponentOrFunction } from '@hanzo/cms/shared'
import React from 'react'

export const WithServerSideProps: WithServerSidePropsComponent = ({
  Component,
  serverOnlyProps,
  ...rest
}) => {
  if (Component) {
    const WithServerSideProps: React.FC = (passedProps) => {
      const propsWithServerOnlyProps = {
        ...passedProps,
        ...(isReactServerComponentOrFunction(Component) ? (serverOnlyProps ?? {}) : {}),
      }

      return <Component {...propsWithServerOnlyProps} />
    }

    return WithServerSideProps(rest)
  }

  return null
}
