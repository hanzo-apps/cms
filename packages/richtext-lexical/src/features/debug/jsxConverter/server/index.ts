import { createServerFeature } from '../../../../utilities/createServerFeature.js'

export const DebugJsxConverterFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#DebugJsxConverterFeatureClient',
  },
  key: 'jsxConverter',
})
