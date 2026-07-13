import type { ContainerClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import type { ClientUploadsAccess } from '@hanzo/cms-plugin-cloud-storage/types'
import type { CMSHandler } from '@hanzo/cms'

import { BlobSASPermissions, generateBlobSASQueryParameters } from '@azure/storage-blob'
import { resolveSignedURLKey } from '@hanzo/cms-plugin-cloud-storage/utilities'
import { APIError, Forbidden } from '@hanzo/cms'

import type { AzureStorageOptions } from './index.js'

interface Args {
  access?: ClientUploadsAccess
  collections: AzureStorageOptions['collections']
  containerName: string
  getStorageClient: () => ContainerClient
  useCompositePrefixes?: boolean
}

const defaultAccess: Args['access'] = ({ req }) => !!req.user

export const getGenerateSignedURLHandler = ({
  access = defaultAccess,
  collections,
  containerName,
  getStorageClient,
  useCompositePrefixes = false,
}: Args): CMSHandler => {
  return async (req) => {
    if (!req.json) {
      throw new APIError('Unreachable')
    }

    const { collectionSlug, docPrefix, filename, mimeType } = (await req.json()) as {
      collectionSlug: string
      docPrefix?: string
      filename: string
      mimeType: string
    }

    const collectionStorageConfig = collections[collectionSlug]
    if (!collectionStorageConfig) {
      throw new APIError(`Collection ${collectionSlug} was not found in Azure storage options`)
    }

    const collectionPrefix =
      (typeof collectionStorageConfig === 'object' && collectionStorageConfig.prefix) || ''

    if (!(await access({ collectionSlug, req }))) {
      throw new Forbidden()
    }

    const { fileKey, sanitizedDocPrefix, sanitizedFilename } = await resolveSignedURLKey({
      collectionPrefix,
      collectionSlug,
      docPrefix,
      filename,
      req,
      useCompositePrefixes,
    })

    const blobClient = getStorageClient().getBlobClient(fileKey)

    const sasToken = generateBlobSASQueryParameters(
      {
        blobName: fileKey,
        containerName,
        contentType: mimeType,
        expiresOn: new Date(Date.now() + 30 * 60 * 1000),
        permissions: BlobSASPermissions.parse('w'),
        startsOn: new Date(),
      },
      getStorageClient().credential as StorageSharedKeyCredential,
    )

    return Response.json({
      docPrefix: sanitizedDocPrefix,
      filename: sanitizedFilename,
      url: `${blobClient.url}?${sasToken.toString()}`,
    })
  }
}
