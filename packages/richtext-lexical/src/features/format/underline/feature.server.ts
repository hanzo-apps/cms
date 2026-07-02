import { createServerFeature } from '../../../utilities/createServerFeature.js'

export const UnderlineFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#UnderlineFeatureClient',
  },
  key: 'underline',
})
