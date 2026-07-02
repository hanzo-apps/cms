import { createServerFeature } from '../../../../utilities/createServerFeature.js'

export const InlineToolbarFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#InlineToolbarFeatureClient',
  },
  key: 'toolbarInline',
})
