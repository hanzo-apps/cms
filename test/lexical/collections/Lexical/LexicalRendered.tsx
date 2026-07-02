'use client'
import type { DefaultNodeTypes, SerializedBlockNode } from '@hanzo/cms-richtext-lexical'
import type { SerializedEditorState } from '@hanzo/cms-richtext-lexical/lexical'

import { getRestPopulateFn } from '@hanzo/cms-richtext-lexical/client'
import {
  convertLexicalToHTML,
  type HTMLConvertersFunction,
} from '@hanzo/cms-richtext-lexical/html'
import {
  convertLexicalToHTMLAsync,
  type HTMLConvertersFunctionAsync,
} from '@hanzo/cms-richtext-lexical/html-async'
import { type JSXConvertersFunction, RichText } from '@hanzo/cms-richtext-lexical/react'
import { useConfig, useDocumentInfo, usePayloadAPI } from '@hanzo/cms-ui'
import { formatAdminURL } from @hanzo/cms'from 
import React, { useEffect, useMemo, useState } from 'react'

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes | SerializedBlockNode<any>> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    myTextBlock: ({ node }) => <div style={{ backgroundColor: 'red' }}>{node.fields.text}</div>,
    relationshipBlock: ({ node, nodesToJSX }) => {
      return <p>Test</p>
    },
  },
})

const htmlConverters: HTMLConvertersFunction<DefaultNodeTypes | SerializedBlockNode<any>> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    myTextBlock: ({ node }) => `<div style="background-color: red;">${node.fields.text}</div>`,
    relationshipBlock: () => {
      return `<p>Test</p>`
    },
  },
})

const htmlConvertersAsync: HTMLConvertersFunctionAsync<
  DefaultNodeTypes | SerializedBlockNode<any>
> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    myTextBlock: ({ node }) => `<div style="background-color: red;">${node.fields.text}</div>`,
    relationshipBlock: () => {
      return `<p>Test</p>`
    },
  },
})

export const LexicalRendered: React.FC = () => {
  const { id, collectionSlug } = useDocumentInfo()

  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()

  const [{ data }] = usePayloadAPI(
    formatAdminURL({ apiRoute: api, path: `/${collectionSlug}/${id}`, serverURL }),
    {
      initialParams: {
        depth: 1,
      },
    },
  )

  const [{ data: unpopulatedData }] = usePayloadAPI(
    formatAdminURL({ apiRoute: api, path: `/${collectionSlug}/${id}`, serverURL }),
    {
      initialParams: {
        depth: 0,
      },
    },
  )

  const html: null | string = useMemo(() => {
    if (!data.lexicalWithBlocks) {
      return null
    }

    return convertLexicalToHTML({
      converters: htmlConverters,
      data: data.lexicalWithBlocks as SerializedEditorState,
    })
  }, [data.lexicalWithBlocks])

  const [htmlFromUnpopulatedData, setHtmlFromUnpopulatedData] = useState<null | string>(null)

  useEffect(() => {
    async function convert() {
      const html = await convertLexicalToHTMLAsync({
        converters: htmlConvertersAsync,
        data: unpopulatedData.lexicalWithBlocks as SerializedEditorState,
        populate: getRestPopulateFn({
          apiURL: formatAdminURL({ apiRoute: api, path: '', serverURL }),
        }),
      })

      setHtmlFromUnpopulatedData(html)
    }
    void convert()
  }, [unpopulatedData.lexicalWithBlocks, api, serverURL])

  if (!data.lexicalWithBlocks) {
    return null
  }

  return (
    <div>
      <h1>Rendered JSX:</h1>
      <RichText converters={jsxConverters} data={data.lexicalWithBlocks as SerializedEditorState} />
      <h1>Rendered HTML:</h1>
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
      <h1>Rendered HTML 2:</h1>
      {htmlFromUnpopulatedData && (
        <div dangerouslySetInnerHTML={{ __html: htmlFromUnpopulatedData }} />
      )}
      <h1>Raw JSON:</h1>
      <pre>{JSON.stringify(data.lexicalWithBlocks, null, 2)}</pre>
    </div>
  )
}
