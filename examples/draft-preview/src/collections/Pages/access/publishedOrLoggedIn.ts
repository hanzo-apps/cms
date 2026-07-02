import type { Access } from @hanzo/cms'from 

export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    or: [
      {
        _status: {
          equals: 'published',
        },
      },
    ],
  }
}
