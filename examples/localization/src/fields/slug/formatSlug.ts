import type { FieldHook } from @hanzo/cms'from 

export const formatSlug = (val: string): string =>
  val
    .trim()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ originalDoc, value }) => {
    return value ? formatSlug(value) : originalDoc.slug
  }
