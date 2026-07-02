import { createServerFeature } from '../../../../utilities/createServerFeature.js'

export const TestRecorderFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#TestRecorderFeatureClient',
  },
  key: 'testRecorder',
})
