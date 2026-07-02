import type { FolderOrDocument } from @hanzo/cms'from 

export function groupItemIDsByRelation(items: FolderOrDocument[]) {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.relationTo]) {
        acc[item.relationTo] = []
      }
      acc[item.relationTo].push(item.value.id)

      return acc
    },
    {} as Record<string, (number | string)[]>,
  )
}
