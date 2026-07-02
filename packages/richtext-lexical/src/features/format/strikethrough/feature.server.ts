import { createServerFeature } from '../../../utilities/createServerFeature.js'
import { STRIKETHROUGH } from './markdownTransformers.js'

export const StrikethroughFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#StrikethroughFeatureClient',

    markdownTransformers: [STRIKETHROUGH],
  },
  key: 'strikethrough',
})
