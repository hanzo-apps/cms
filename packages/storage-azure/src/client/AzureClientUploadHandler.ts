'use client'
import { createClientUploadHandler } from '@hanzo/cms-plugin-cloud-storage/client'
import { formatAdminURL } from '@hanzo/cms/shared'

export const AzureClientUploadHandler = createClientUploadHandler({
  handler: async ({
    apiRoute,
    collectionSlug,
    docPrefix,
    file,
    serverHandlerPath,
    serverURL,
    updateFilename,
  }) => {
    const endpointRoute = formatAdminURL({
      apiRoute,
      path: serverHandlerPath,
      serverURL,
    })
    const response = await fetch(endpointRoute, {
      body: JSON.stringify({
        collectionSlug,
        docPrefix,
        filename: file.name,
        mimeType: file.type,
      }),
      credentials: 'include',
      method: 'POST',
    })

    const {
      docPrefix: sanitizedDocPrefix,
      filename: sanitizedFilename,
      url,
    } = (await response.json()) as {
      docPrefix: string
      filename?: string
      url: string
    }

    if (sanitizedFilename && sanitizedFilename !== file.name) {
      updateFilename(sanitizedFilename)
    }

    await fetch(url, {
      body: file,
      headers: {
        'Content-Length': file.size.toString(),
        'Content-Type': file.type,
        // Required for azure
        'x-ms-blob-type': 'BlockBlob',
      },
      method: 'PUT',
    })

    return { prefix: sanitizedDocPrefix }
  },
})
