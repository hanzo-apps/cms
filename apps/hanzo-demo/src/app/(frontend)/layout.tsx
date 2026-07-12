import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Hanzo CMS — headless content for the Hanzo platform.',
  title: 'Hanzo CMS',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
