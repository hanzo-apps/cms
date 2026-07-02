import type { CollectionConfig } from '@hanzo/cms'

/**
 * Media/DAM collection. Uploads are routed by @hanzo/cms-storage-s3 to
 * SeaweedFS (hanzoai/s3), per-org prefix. Proves a real S3 object lands.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: true,
}
