import type { CollectionBeforeDeleteHook } from '../../index.js'

type Args = {
  folderFieldName: string
  folderSlug: string
}
export const deleteSubfoldersBeforeDelete = ({
  folderFieldName,
  folderSlug,
}: Args): CollectionBeforeDeleteHook => {
  return async ({ id, req }) => {
    await req.cms.delete({
      collection: folderSlug,
      req,
      where: {
        [folderFieldName]: {
          equals: id,
        },
      },
    })
  }
}
