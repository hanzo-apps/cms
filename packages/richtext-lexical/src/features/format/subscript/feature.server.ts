import { createServerFeature } from '../../../utilities/createServerFeature.js'

export const SubscriptFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#SubscriptFeatureClient',
  },
  key: 'subscript',
})
