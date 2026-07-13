import type { SanitizedCollectionConfig } from '../collections/config/types.js'
import type { SanitizedGlobalConfig } from '../globals/config/types.js'
import type { CMSRequest } from '../types/index.js'

export const isEntityHidden = ({
  hidden,
  user,
}: {
  hidden: SanitizedCollectionConfig['admin']['hidden'] | SanitizedGlobalConfig['admin']['hidden']
  user: CMSRequest['user']
}) => {
  return typeof hidden === 'function' ? hidden({ user: user! }) : hidden === true
}
