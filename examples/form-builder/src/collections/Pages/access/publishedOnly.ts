import type { Access } from @hanzo/cms'from 

export const publishedOnly: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
