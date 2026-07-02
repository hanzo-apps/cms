import { createServerFeature } from '../../../utilities/createServerFeature.js'

export const SuperscriptFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#SuperscriptFeatureClient',
  },
  key: 'superscript',
})
